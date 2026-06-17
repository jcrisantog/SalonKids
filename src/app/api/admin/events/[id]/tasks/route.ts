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
};

const eventTaskSelect =
  "id, event_id, task_name, description, scheduled_time, staff_id, role_responsible, status, visibility, is_manual_override, source_rule_task_id, source_master_task_id, created_at, event_task_staff(staff_id, sort_order, staff(id, name, primary_role, is_active))";

type MasterTaskGroup = {
  id: string;
  name: string;
  assignment_group_id: string | null;
  assignment_group_key: string | null;
  assignment_group_label: string | null;
  task_groups?: {
    id: string;
    name: string;
    key: string;
    is_active: boolean;
  } | Array<{
    id: string;
    name: string;
    key: string;
    is_active: boolean;
  }> | null;
};

type EventTaskRow = {
  id: string;
  task_name: string;
  source_master_task_id: string | null;
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

export async function GET(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;

  const [eventResult, tasksResult, staffResult, masterTasksResult] = await Promise.all([
    supabaseAdmin
      .from("events")
      .select("id, celebratory_name, event_date, start_time, end_time, token_unico, status")
      .eq("id", id)
      .single(),
    supabaseAdmin
      .from("event_tasks")
      .select(eventTaskSelect)
      .eq("event_id", id)
      .order("scheduled_time", { ascending: true }),
    supabaseAdmin
      .from("staff")
      .select("id, name, primary_role, is_active")
      .order("name", { ascending: true }),
    supabaseAdmin
      .from("master_tasks")
      .select(
        "id, name, assignment_group_id, assignment_group_key, assignment_group_label, task_groups(id, name, key, is_active)",
      ),
  ]);

  if (eventResult.error || tasksResult.error || staffResult.error || masterTasksResult.error) {
    return NextResponse.json(
      { error: "No se pudieron cargar las tareas del evento." },
      { status: 500 },
    );
  }

  const masterTasks = (masterTasksResult.data ?? []) as unknown as MasterTaskGroup[];
  const masterTaskById = new Map(masterTasks.map((task) => [task.id, task]));
  const masterTaskByName = new Map(masterTasks.map((task) => [task.name.trim().toLowerCase(), task]));
  const tasks = ((tasksResult.data ?? []) as unknown as EventTaskRow[]).map((task) => {
    const masterTask = task.source_master_task_id
      ? masterTaskById.get(task.source_master_task_id) ?? masterTaskByName.get(task.task_name.trim().toLowerCase())
      : masterTaskByName.get(task.task_name.trim().toLowerCase());
    const embeddedGroup = Array.isArray(masterTask?.task_groups)
      ? masterTask?.task_groups[0]
      : masterTask?.task_groups;
    const taskGroup = embeddedGroup
      ? embeddedGroup
      : masterTask?.assignment_group_id && masterTask.assignment_group_key && masterTask.assignment_group_label
        ? {
            id: masterTask.assignment_group_id,
            name: masterTask.assignment_group_label,
            key: masterTask.assignment_group_key,
            is_active: true,
          }
        : null;

    return {
      ...task,
      task_group: taskGroup,
    };
  });

  return NextResponse.json({
    event: eventResult.data,
    tasks,
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

  const staffIds = normalizeStaffIds(payload.staff_ids ?? payload.staff_id);
  const staffError = await validateStaffIds(staffIds);

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
      staff_id: staffIds[0] ?? null,
      role_responsible: cleanText(payload.role_responsible),
      status: payload.status ?? "pendiente",
      visibility: payload.visibility ?? "interna",
      is_manual_override: true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear la tarea." }, { status: 500 });
  }

  const relationError = await replaceStaffRelations({
    table: "event_task_staff",
    ownerColumn: "event_task_id",
    ownerId: data.id,
    staffIds,
  });

  if (relationError) {
    await supabaseAdmin.from("event_tasks").delete().eq("id", data.id);
    return NextResponse.json({ error: "No se pudieron guardar los responsables." }, { status: 500 });
  }

  const taskResult = await supabaseAdmin.from("event_tasks").select(eventTaskSelect).eq("id", data.id).single();

  if (taskResult.error) {
    return NextResponse.json({ error: "No se pudo cargar la tarea creada." }, { status: 500 });
  }

  return NextResponse.json({ task: taskResult.data }, { status: 201 });
}
