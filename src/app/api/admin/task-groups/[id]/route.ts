import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { normalizeAssignmentGroup } from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type TaskGroupPayload = {
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

function duplicateGroupResponse() {
  return NextResponse.json(
    { error: "Ya existe un grupo con ese nombre o clave." },
    { status: 400 },
  );
}

export async function PATCH(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const body = (await request.json()) as TaskGroupPayload;
  const normalized = normalizeAssignmentGroup(body.name);

  if (!normalized.key || !normalized.label) {
    return NextResponse.json({ error: "El nombre del grupo es obligatorio." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("task_groups")
    .update({
      name: normalized.label,
      key: normalized.key,
      description: body.description?.trim() || null,
      is_active: body.is_active ?? true,
      sort_order: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, name, key, description, is_active, sort_order, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return duplicateGroupResponse();
    }

    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "El grupo de tareas no existe." }, { status: 404 });
    }

    return NextResponse.json({ error: "No se pudo actualizar el grupo de tareas." }, { status: 500 });
  }

  return NextResponse.json({ group: data });
}

export async function DELETE(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const { count, error: countError } = await supabaseAdmin
    .from("master_tasks")
    .select("id", { count: "exact", head: true })
    .eq("assignment_group_id", id);

  if (countError) {
    return NextResponse.json({ error: "No se pudo validar si el grupo esta en uso." }, { status: 500 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `No se puede eliminar un grupo con tareas asociadas. Este grupo tiene ${count} tarea(s).`,
        taskCount: count,
      },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("task_groups").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el grupo de tareas." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
