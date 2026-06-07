import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
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
  visibility?: "interna" | "publica";
  status?: "pendiente" | "en_progreso" | "completada";
  is_manual_override?: boolean;
};

function cleanText(value?: string) {
  return value?.trim() || null;
}

function normalizeTime(value?: string) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

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

  const { id, taskId } = await context.params;
  const payload = (await request.json()) as TaskPayload;
  const taskName = cleanText(payload.task_name);

  if (!taskName) {
    return NextResponse.json({ error: "El nombre de la tarea es obligatorio." }, { status: 400 });
  }

  const staffError = await validateStaffId(payload.staff_id);

  if (staffError) {
    return NextResponse.json({ error: staffError }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("event_tasks")
    .update({
      task_name: taskName,
      description: cleanText(payload.description),
      scheduled_time: normalizeTime(payload.scheduled_time),
      staff_id: payload.staff_id || null,
      role_responsible: cleanText(payload.role_responsible),
      status: payload.status ?? "pendiente",
      visibility: payload.visibility ?? "interna",
      is_manual_override: payload.is_manual_override ?? true,
    })
    .eq("id", taskId)
    .eq("event_id", id)
    .select(
      "id, event_id, task_name, description, scheduled_time, staff_id, role_responsible, status, visibility, is_manual_override, created_at",
    )
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
