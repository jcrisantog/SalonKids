import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import {
  getTaskGroupById,
  normalizeAssignmentGroup,
  normalizeRequiredResponsibleCount,
  normalizeStaffIds,
  replaceStaffRelations,
  validateStaffIds,
} from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

const masterTaskSelect =
  "id, name, base_description, visibility, area, default_role, default_staff_id, required_responsible_count, assignment_group_id, assignment_group_key, assignment_group_label, created_at, task_groups(id, name, key, is_active), master_task_default_staff(staff_id, sort_order, staff(id, name, primary_role, is_active))";

async function getMasterTask(id: string) {
  return supabaseAdmin.from("master_tasks").select(masterTaskSelect).eq("id", id).single();
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
    default_staff_ids?: string[];
    required_responsible_count?: number;
    assignment_group_id?: string | null;
    assignment_group?: string | null;
    assignment_group_label?: string | null;
  };

  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "El nombre de la tarea es obligatorio." }, { status: 400 });
  }

  const defaultStaffIds = normalizeStaffIds(body.default_staff_ids ?? body.default_staff_id);
  const requiredResponsibleCount = normalizeRequiredResponsibleCount(body.required_responsible_count);
  const taskGroup = await getTaskGroupById(body.assignment_group_id);
  const legacyAssignmentGroup = normalizeAssignmentGroup(body.assignment_group_label ?? body.assignment_group);

  if (taskGroup && "error" in taskGroup) {
    return NextResponse.json({ error: taskGroup.error }, { status: 400 });
  }

  if (!requiredResponsibleCount) {
    return NextResponse.json(
      { error: "La cantidad de responsables debe ser un entero mayor que cero." },
      { status: 400 },
    );
  }

  const staffError = await validateStaffIds(defaultStaffIds);

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
      default_staff_id: defaultStaffIds[0] ?? null,
      required_responsible_count: requiredResponsibleCount,
      assignment_group_id: taskGroup?.id ?? null,
      assignment_group_key: taskGroup?.key ?? legacyAssignmentGroup.key,
      assignment_group_label: taskGroup?.label ?? legacyAssignmentGroup.label,
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar la tarea." }, { status: 500 });
  }

  const relationError = await replaceStaffRelations({
    table: "master_task_default_staff",
    ownerColumn: "master_task_id",
    ownerId: data.id,
    staffIds: defaultStaffIds,
  });

  if (relationError) {
    return NextResponse.json({ error: "No se pudieron guardar los responsables default." }, { status: 500 });
  }

  const taskResult = await getMasterTask(data.id);

  if (taskResult.error) {
    return NextResponse.json({ error: "No se pudo cargar la tarea actualizada." }, { status: 500 });
  }

  return NextResponse.json({ task: taskResult.data });
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
