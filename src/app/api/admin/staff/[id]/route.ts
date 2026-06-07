import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    primary_role?: string;
    is_active?: boolean;
  };

  const payload = {
    name: body.name?.trim(),
    primary_role: body.primary_role?.trim(),
    is_active: body.is_active,
  };

  if (!payload.name || !payload.primary_role) {
    return NextResponse.json(
      { error: "Nombre y rol principal son obligatorios." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .update(payload)
    .eq("id", id)
    .select("id, name, primary_role, is_active, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar el registro." }, { status: 500 });
  }

  return NextResponse.json({ staff: data });
}

export async function DELETE(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const { error } = await supabaseAdmin.from("staff").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el registro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
