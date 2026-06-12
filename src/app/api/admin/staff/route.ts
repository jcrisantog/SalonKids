import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { supabaseAdmin } from "@/lib/supabase-server";

const DEFAULT_STAFF_ROLE = "General";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .select("id, name, primary_role, is_active, created_at")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "No se pudo cargar el personal." }, { status: 500 });
  }

  return NextResponse.json({ staff: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as {
    name?: string;
    primary_role?: string;
    is_active?: boolean;
  };

  const name = body.name?.trim();
  const primaryRole = body.primary_role?.trim() || DEFAULT_STAFF_ROLE;

  if (!name) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .insert({
      name,
      primary_role: primaryRole,
      is_active: body.is_active ?? true,
    })
    .select("id, name, primary_role, is_active, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear el registro." }, { status: 500 });
  }

  return NextResponse.json({ staff: data }, { status: 201 });
}
