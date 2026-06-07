import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

async function validateStaffId(staffId?: string | null) {
  if (!staffId) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .select("id")
    .eq("id", staffId)
    .maybeSingle();

  if (error || !data) {
    return "Selecciona un responsable valido del catalogo de personal.";
  }

  return null;
}

export async function PATCH(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    base_description?: string;
    visibility?: "interna" | "publica";
    area?: string;
    default_role?: string;
    default_staff_id?: string | null;
  };

  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "El nombre de la tarea es obligatorio." }, { status: 400 });
  }

  const staffError = await validateStaffId(body.default_staff_id);

  if (staffError) {
    return NextResponse.json({ error: staffError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("master_tasks")
    .update({
      name,
      base_description: body.base_description?.trim() || null,
      visibility: body.visibility ?? "interna",
      area: body.area?.trim() || null,
      default_role: body.default_role?.trim() || null,
      default_staff_id: body.default_staff_id || null,
    })
    .eq("id", id)
    .select("id, name, base_description, visibility, area, default_role, default_staff_id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar la tarea." }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}

export async function DELETE(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const { error } = await supabaseAdmin.from("master_tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar la tarea." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
