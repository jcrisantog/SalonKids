import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { normalizeAssignmentGroup } from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";

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

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const activeOnly = url.searchParams.get("activeOnly") === "true";
  let query = supabaseAdmin
    .from("task_groups")
    .select("id, name, key, description, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const [groupsResult, tasksResult] = await Promise.all([
    query,
    supabaseAdmin.from("master_tasks").select("assignment_group_id").not("assignment_group_id", "is", null),
  ]);

  if (groupsResult.error || tasksResult.error) {
    return NextResponse.json({ error: "No se pudieron cargar los grupos de tareas." }, { status: 500 });
  }

  const counts = new Map<string, number>();

  for (const task of tasksResult.data ?? []) {
    const groupId = task.assignment_group_id as string | null;

    if (groupId) {
      counts.set(groupId, (counts.get(groupId) ?? 0) + 1);
    }
  }

  const groups = (groupsResult.data ?? []).map((group) => ({
    ...group,
    task_count: counts.get(group.id) ?? 0,
  }));

  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const body = (await request.json()) as TaskGroupPayload;
  const normalized = normalizeAssignmentGroup(body.name);

  if (!normalized.key || !normalized.label) {
    return NextResponse.json({ error: "El nombre del grupo es obligatorio." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("task_groups")
    .insert({
      name: normalized.label,
      key: normalized.key,
      description: body.description?.trim() || null,
      is_active: body.is_active ?? true,
      sort_order: 0,
    })
    .select("id, name, key, description, is_active, sort_order, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      return duplicateGroupResponse();
    }

    return NextResponse.json({ error: "No se pudo crear el grupo de tareas." }, { status: 500 });
  }

  return NextResponse.json({ group: { ...data, task_count: 0 } }, { status: 201 });
}
