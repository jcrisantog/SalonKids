import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
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

export async function GET(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;

  const [eventResult, tasksResult, staffResult] = await Promise.all([
    supabaseAdmin
      .from("events")
      .select("id, celebratory_name, event_date, start_time, end_time, token_unico, status")
      .eq("id", id)
      .single(),
    supabaseAdmin
      .from("event_tasks")
      .select(
        "id, event_id, task_name, description, scheduled_time, staff_id, role_responsible, status, visibility, is_manual_override, created_at",
      )
      .eq("event_id", id)
      .order("scheduled_time", { ascending: true }),
    supabaseAdmin
      .from("staff")
      .select("id, name, primary_role, is_active")
      .order("name", { ascending: true }),
  ]);

  if (eventResult.error || tasksResult.error || staffResult.error) {
    return NextResponse.json(
      { error: "No se pudieron cargar las tareas del evento." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    event: eventResult.data,
    tasks: tasksResult.data ?? [],
    staff: staffResult.data ?? [],
  });
}

export async function POST(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
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
    .insert({
      event_id: id,
      task_name: taskName,
      description: cleanText(payload.description),
      scheduled_time: normalizeTime(payload.scheduled_time),
      staff_id: payload.staff_id || null,
      role_responsible: cleanText(payload.role_responsible),
      status: payload.status ?? "pendiente",
      visibility: payload.visibility ?? "interna",
      is_manual_override: true,
    })
    .select(
      "id, event_id, task_name, description, scheduled_time, staff_id, role_responsible, status, visibility, is_manual_override, created_at",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear la tarea." }, { status: 500 });
  }

  return NextResponse.json({ task: data }, { status: 201 });
}
