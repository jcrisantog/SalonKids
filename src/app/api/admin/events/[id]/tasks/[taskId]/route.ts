import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import {
  normalizeStaffIds,
  replaceStaffRelations,
  validateStaffIds,
} from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
    taskId: string;
  }>;
};

type TaskPayload = {
  task_name?: string;
  description?: string;
  scheduled_time?: string;
  role_responsible?: string;
  staff_id?: string | null;
  staff_ids?: string[];
  visibility?: "interna" | "publica";
  status?: "pendiente" | "en_progreso" | "completada";
  is_manual_override?: boolean;
};

const eventTaskSelect =
  "id, event_id, task_name, description, scheduled_time, staff_id, role_responsible, status, visibility, is_manual_override, source_rule_task_id, source_master_task_id, created_at, event_task_staff(staff_id, sort_order, staff(id, name, primary_role, is_active))";

function cleanText(value?: string) {
  return value?.trim() || null;
}

function normalizeTime(value?: string) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

export async function PATCH(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id, taskId } = await context.params;
  const payload = (await request.json()) as TaskPayload;
  const taskName = cleanText(payload.task_name);

  if (!taskName) {
    return NextResponse.json({ error: "El nombre de la tarea es obligatorio." }, { status: 400 });
  }

  const staffIds = normalizeStaffIds(payload.staff_ids ?? payload.staff_id);
  const staffError = await validateStaffIds(staffIds);

  if (staffError) {
    return NextResponse.json({ error: staffError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("event_tasks")
    .update({
      task_name: taskName,
      description: cleanText(payload.description),
      scheduled_time: normalizeTime(payload.scheduled_time),
      staff_id: staffIds[0] ?? null,
      role_responsible: cleanText(payload.role_responsible),
      status: payload.status ?? "pendiente",
      visibility: payload.visibility ?? "interna",
      is_manual_override: payload.is_manual_override ?? true,
    })
    .eq("id", taskId)
    .eq("event_id", id)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo actualizar la tarea." }, { status: 500 });
  }

  const relationError = await replaceStaffRelations({
    table: "event_task_staff",
    ownerColumn: "event_task_id",
    ownerId: data.id,
    staffIds,
  });

  if (relationError) {
    return NextResponse.json({ error: "No se pudieron guardar los responsables." }, { status: 500 });
  }

  const taskResult = await supabaseAdmin.from("event_tasks").select(eventTaskSelect).eq("id", data.id).single();

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

  const { id, taskId } = await context.params;
  const { error } = await supabaseAdmin
    .from("event_tasks")
    .delete()
    .eq("id", taskId)
    .eq("event_id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar la tarea." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
