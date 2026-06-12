import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import {
  GUIDELINES_KEY,
  MAX_GUIDELINES_HTML_LENGTH,
  normalizeGuidelinesHtml,
} from "@/lib/guidelines-notices";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .select("value, updated_at")
    .eq("key", GUIDELINES_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar los lineamientos y avisos." },
      { status: 500 },
    );
  }

  const normalized = normalizeGuidelinesHtml(data?.value ?? "");

  return NextResponse.json({
    html: normalized.html,
    hasContent: normalized.hasContent,
    updated_at: data?.updated_at ?? null,
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as { html?: unknown };

  if (typeof body.html !== "string") {
    return NextResponse.json(
      { error: "El contenido de lineamientos es obligatorio." },
      { status: 400 },
    );
  }

  if (body.html.length > MAX_GUIDELINES_HTML_LENGTH) {
    return NextResponse.json(
      { error: "El contenido de lineamientos es demasiado largo." },
      { status: 400 },
    );
  }

  const normalized = normalizeGuidelinesHtml(body.html);
  const { data, error } = await supabaseAdmin
    .from("admin_settings")
    .upsert(
      {
        key: GUIDELINES_KEY,
        value: normalized.html,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )
    .select("value, updated_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron guardar los lineamientos y avisos." },
      { status: 500 },
    );
  }

  const saved = normalizeGuidelinesHtml(data.value ?? "");

  return NextResponse.json({
    html: saved.html,
    hasContent: saved.hasContent,
    updated_at: data.updated_at,
  });
}
