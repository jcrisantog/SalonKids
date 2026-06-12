import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import {
  getAssignedStaffIds,
  isMissingRelationError,
  replaceStaffRelations,
  type StaffAssignmentMember,
} from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type AssignmentMode = "complete" | "replace";

type QueryError = { code?: string; message?: string; details?: string } | null;
type QueryResult<T> = {
  data: T[] | null;
  error: QueryError;
};

type EventTaskForAssignment = {
  id: string;
  task_name: string;
  staff_id: string | null;
  source_rule_task_id: string | null;
  source_master_task_id: string | null;
  event_task_staff?: StaffAssignmentMember[] | null;
};

type RuleTaskForAssignment = {
  id: string;
  master_task_id: string | null;
  override_staff_id?: string | null;
  questionnaire_task_rule_task_staff?: StaffAssignmentMember[] | null;
};

type MasterTaskForAssignment = {
  id: string;
  name: string;
  required_responsible_count: number | null;
  default_staff_id?: string | null;
  master_task_default_staff?: StaffAssignmentMember[] | null;
};

function sameIds(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function shuffleIds(ids: string[]) {
  return [...ids].sort(() => Math.random() - 0.5);
}

function addUnique(target: string[], candidates: string[], limit: number) {
  for (const candidate of candidates) {
    if (target.length >= limit) {
      break;
    }

    if (!target.includes(candidate)) {
      target.push(candidate);
    }
  }
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { mode?: AssignmentMode };
  const mode: AssignmentMode = body.mode === "replace" ? "replace" : "complete";

  let [tasksResult, staffResult]: [QueryResult<unknown>, QueryResult<{ id: string }>] = await Promise.all([
    supabaseAdmin
      .from("event_tasks")
      .select(
        "id, task_name, staff_id, source_rule_task_id, source_master_task_id, event_task_staff(staff_id, sort_order)",
      )
      .eq("event_id", id),
    supabaseAdmin.from("staff").select("id").eq("is_active", true).order("name", { ascending: true }),
  ]);

  if (isMissingRelationError(tasksResult.error)) {
    [tasksResult, staffResult] = await Promise.all([
      supabaseAdmin
        .from("event_tasks")
        .select("id, task_name, staff_id, source_rule_task_id, source_master_task_id")
        .eq("event_id", id),
      supabaseAdmin.from("staff").select("id").eq("is_active", true).order("name", { ascending: true }),
    ]);
  }

  if (tasksResult.error || staffResult.error) {
    return NextResponse.json({ error: "No se pudieron cargar datos para asignar responsables." }, { status: 500 });
  }

  const tasks = (tasksResult.data ?? []) as EventTaskForAssignment[];
  const activeStaffIds = ((staffResult.data ?? []) as Array<{ id: string }>).map((member) => member.id);

  if (activeStaffIds.length === 0) {
    return NextResponse.json({ error: "No hay staff activo para asignar." }, { status: 400 });
  }

  const sourceRuleTaskIds = Array.from(
    new Set(tasks.map((task) => task.source_rule_task_id).filter(Boolean) as string[]),
  );
  let ruleTasksResult: QueryResult<unknown> = sourceRuleTaskIds.length
    ? await supabaseAdmin
        .from("questionnaire_task_rule_tasks")
        .select("id, master_task_id, override_staff_id, questionnaire_task_rule_task_staff(staff_id, sort_order)")
        .in("id", sourceRuleTaskIds)
    : { data: [], error: null };

  if (isMissingRelationError(ruleTasksResult.error)) {
    ruleTasksResult = sourceRuleTaskIds.length
      ? await supabaseAdmin
          .from("questionnaire_task_rule_tasks")
          .select("id, master_task_id, override_staff_id")
          .in("id", sourceRuleTaskIds)
      : { data: [], error: null };
  }

  if (ruleTasksResult.error) {
    return NextResponse.json({ error: "No se pudieron cargar defaults de reglas." }, { status: 500 });
  }

  const ruleTasks = (ruleTasksResult.data ?? []) as RuleTaskForAssignment[];
  const ruleTaskById = new Map(ruleTasks.map((ruleTask) => [ruleTask.id, ruleTask]));
  const masterTaskIds = Array.from(
    new Set(
      [
        ...tasks.map((task) => task.source_master_task_id).filter(Boolean),
        ...ruleTasks.map((ruleTask) => ruleTask.master_task_id).filter(Boolean),
      ] as string[],
    ),
  );
  const taskNames = Array.from(new Set(tasks.map((task) => task.task_name).filter(Boolean)));
  let masterTasksResult: QueryResult<unknown> = masterTaskIds.length || taskNames.length
    ? await supabaseAdmin
        .from("master_tasks")
        .select("id, name, default_staff_id, required_responsible_count, master_task_default_staff(staff_id, sort_order)")
        .or(
          [
            masterTaskIds.length ? `id.in.(${masterTaskIds.join(",")})` : "",
            taskNames.length
              ? `name.in.(${taskNames.map((name) => `"${name.replace(/"/g, '\\"')}"`).join(",")})`
              : "",
          ]
            .filter(Boolean)
            .join(","),
        )
    : { data: [], error: null };

  if (isMissingRelationError(masterTasksResult.error)) {
    masterTasksResult = masterTaskIds.length || taskNames.length
      ? await supabaseAdmin
          .from("master_tasks")
          .select("id, name, default_staff_id, required_responsible_count")
          .or(
            [
              masterTaskIds.length ? `id.in.(${masterTaskIds.join(",")})` : "",
              taskNames.length
                ? `name.in.(${taskNames.map((name) => `"${name.replace(/"/g, '\\"')}"`).join(",")})`
                : "",
            ]
              .filter(Boolean)
              .join(","),
          )
      : { data: [], error: null };
  }

  if (masterTasksResult.error) {
    return NextResponse.json({ error: "No se pudieron cargar defaults de tareas maestras." }, { status: 500 });
  }

  const masterTasks = (masterTasksResult.data ?? []) as MasterTaskForAssignment[];
  const masterTaskById = new Map(masterTasks.map((masterTask) => [masterTask.id, masterTask]));
  const masterTaskByName = new Map(masterTasks.map((masterTask) => [normalizeName(masterTask.name), masterTask]));
  let updated = 0;
  let incomplete = 0;
  let unchanged = 0;
  let errors = 0;

  for (const task of tasks) {
    const ruleTask = task.source_rule_task_id ? ruleTaskById.get(task.source_rule_task_id) : null;
    const masterTaskId = task.source_master_task_id ?? ruleTask?.master_task_id ?? null;
    const masterTask = masterTaskId
      ? masterTaskById.get(masterTaskId) ?? masterTaskByName.get(normalizeName(task.task_name))
      : masterTaskByName.get(normalizeName(task.task_name));
    const requiredCount = masterTask?.required_responsible_count ?? 1;
    const existing = getAssignedStaffIds(task.event_task_staff);

    if (existing.length === 0 && task.staff_id) {
      existing.push(task.staff_id);
    }

    const nextStaffIds = mode === "replace" ? [] : [...existing];
    const ruleDefaults = getAssignedStaffIds(ruleTask?.questionnaire_task_rule_task_staff);
    const masterDefaults = getAssignedStaffIds(masterTask?.master_task_default_staff);
    const defaultIds = ruleDefaults.length ? ruleDefaults : masterDefaults;
    const legacyDefaultIds = [
      ruleTask?.override_staff_id || masterTask?.default_staff_id,
    ].filter(Boolean) as string[];

    addUnique(nextStaffIds, defaultIds.length ? defaultIds : legacyDefaultIds, requiredCount);
    addUnique(nextStaffIds, shuffleIds(activeStaffIds), requiredCount);

    if (nextStaffIds.length < requiredCount) {
      incomplete += 1;
    }

    if (mode === "complete" && sameIds(existing, nextStaffIds)) {
      unchanged += 1;
      continue;
    }

    const { error: updateError } = await supabaseAdmin
      .from("event_tasks")
      .update({
        staff_id: nextStaffIds[0] ?? null,
        is_manual_override: true,
      })
      .eq("id", task.id)
      .eq("event_id", id);

    if (updateError) {
      errors += 1;
      continue;
    }

    const relationError = await replaceStaffRelations({
      table: "event_task_staff",
      ownerColumn: "event_task_id",
      ownerId: task.id,
      staffIds: nextStaffIds,
    });

    if (relationError) {
      errors += 1;
      continue;
    }

    updated += 1;
  }

  return NextResponse.json({
    updated,
    incomplete,
    unchanged,
    errors,
    mode,
  });
}
