import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import {
  getAssignedStaffIds,
  isMissingRelationError,
  replaceStaffRelations,
  type StaffAssignmentMember,
} from "@/lib/staff-assignments";
import {
  loadRotationStatsForEvent,
  resolveActivityIdentity,
  type ActivityIdentity,
  type RotationStats,
} from "@/lib/staff-task-history";
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
  is_manual_override?: boolean | null;
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
  assignment_group_id?: string | null;
  assignment_group_key?: string | null;
  assignment_group_label?: string | null;
  default_staff_id?: string | null;
  master_task_default_staff?: StaffAssignmentMember[] | null;
};

type TaskAssignmentContext = {
  task: EventTaskForAssignment;
  ruleTask: RuleTaskForAssignment | null;
  masterTask: MasterTaskForAssignment | null;
  existing: string[];
  selectableStaffIds: string[];
  hasSelectableRestriction: boolean;
  requiredCount: number;
  activity: ActivityIdentity;
};

type AssignmentUnit = {
  key: string;
  tasks: TaskAssignmentContext[];
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

function addAllUnique(target: string[], candidates: string[]) {
  for (const candidate of candidates) {
    if (!target.includes(candidate)) {
      target.push(candidate);
    }
  }
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function buildAssignmentUnits(contexts: TaskAssignmentContext[]) {
  const units: AssignmentUnit[] = [];
  const groupedUnits = new Map<string, AssignmentUnit>();

  for (const context of contexts) {
    const catalogGroupId = context.masterTask?.assignment_group_id?.trim();
    const legacyGroupKey = context.masterTask?.assignment_group_key?.trim();
    const groupKey = catalogGroupId ? `id:${catalogGroupId}` : legacyGroupKey ? `legacy:${legacyGroupKey}` : "";

    if (!groupKey) {
      units.push({ key: `task:${context.task.id}`, tasks: [context] });
      continue;
    }

    const unit = groupedUnits.get(groupKey) ?? { key: `group:${groupKey}`, tasks: [] };
    unit.tasks.push(context);
    groupedUnits.set(groupKey, unit);
  }

  return [...groupedUnits.values(), ...units];
}

function getUnitExistingIds({
  activityKeys,
  candidateIds,
  mode,
  stats,
  unit,
}: {
  activityKeys: string[];
  candidateIds: string[];
  mode: AssignmentMode;
  stats: RotationStats;
  unit: AssignmentUnit;
}) {
  if (mode === "replace") {
    return [];
  }

  const existingIds: string[] = [];

  unit.tasks.forEach((context) => {
    if (context.task.is_manual_override) {
      for (const staffId of context.existing) {
        const currentRepeatCount = getActivityRepeatCount(stats, staffId, activityKeys);
        const hasBetterCandidate = candidateIds.some(
          (candidateId) =>
            candidateId !== staffId &&
            !context.existing.includes(candidateId) &&
            getActivityRepeatCount(stats, candidateId, activityKeys) < currentRepeatCount,
        );

        if (!hasBetterCandidate) {
          addAllUnique(existingIds, [staffId]);
        }
      }
    }
  });

  return existingIds;
}

function intersectIds(first: string[], second: string[]) {
  const secondSet = new Set(second);

  return first.filter((id) => secondSet.has(id));
}

function getUnitCandidateIds(unit: AssignmentUnit, activeStaffIds: string[]) {
  const restrictedLists = unit.tasks
    .filter((context) => context.hasSelectableRestriction)
    .map((context) => context.selectableStaffIds);

  if (restrictedLists.length === 0) {
    return activeStaffIds;
  }

  const [firstList, ...remainingLists] = restrictedLists;
  const candidateIds = remainingLists.reduce(intersectIds, firstList);
  const activeSet = new Set(activeStaffIds);

  return candidateIds.filter((staffId) => activeSet.has(staffId));
}

function getUnitActivity(unit: AssignmentUnit) {
  return unit.tasks[0]?.activity;
}

function getUnitRotationKeys(unit: AssignmentUnit) {
  const exactKeys = new Set<string>();
  const fallbackKeys = new Set<string>();

  for (const context of unit.tasks) {
    for (const key of context.activity.keys) {
      if (key.startsWith("master:") || key.startsWith("task:")) {
        exactKeys.add(key);
      } else {
        fallbackKeys.add(key);
      }
    }
  }

  return exactKeys.size > 0 ? Array.from(exactKeys) : Array.from(fallbackKeys);
}

function orderCandidatesByRotation({
  activityKeys,
  candidateIds,
  existingIds,
  plannedAssignmentsByStaff,
  stats,
}: {
  activityKeys: string[];
  candidateIds: string[];
  existingIds: string[];
  plannedAssignmentsByStaff: Map<string, number>;
  stats: RotationStats;
}) {
  const existingSet = new Set(existingIds);

  return shuffleIds(candidateIds)
    .filter((staffId) => !existingSet.has(staffId))
    .sort((a, b) => {
      const aActivityCount = getActivityRepeatCount(stats, a, activityKeys);
      const bActivityCount = getActivityRepeatCount(stats, b, activityKeys);

      if (aActivityCount !== bActivityCount) {
        return aActivityCount - bActivityCount;
      }

      const aPlannedTotal = plannedAssignmentsByStaff.get(a) ?? 0;
      const bPlannedTotal = plannedAssignmentsByStaff.get(b) ?? 0;

      if (aPlannedTotal !== bPlannedTotal) {
        return aPlannedTotal - bPlannedTotal;
      }

      const aExactTotal = getTotalRepeatCount(stats, a, activityKeys);
      const bExactTotal = getTotalRepeatCount(stats, b, activityKeys);

      if (aExactTotal !== bExactTotal) {
        return aExactTotal - bExactTotal;
      }

      const aTotal = stats.totalAssignmentsByStaff.get(a) ?? 0;
      const bTotal = stats.totalAssignmentsByStaff.get(b) ?? 0;

      if (aTotal !== bTotal) {
        return aTotal - bTotal;
      }

      return 0;
    });
}

function getActivityRepeatCount(stats: RotationStats, staffId: string, activityKeys: string[]) {
  const activityCounts = stats.sameActivityByStaff.get(staffId);

  if (!activityCounts) {
    return 0;
  }

  return Math.max(...activityKeys.map((activityKey) => activityCounts.get(activityKey) ?? 0), 0);
}

function getTotalRepeatCount(stats: RotationStats, staffId: string, activityKeys: string[]) {
  const activityCounts = stats.sameActivityByStaff.get(staffId);

  if (!activityCounts) {
    return 0;
  }

  return activityKeys.reduce((total, activityKey) => total + (activityCounts.get(activityKey) ?? 0), 0);
}

function hasUnavoidableRepeat({
  activityKeys,
  candidateIds,
  selectedIds,
  stats,
}: {
  activityKeys: string[];
  candidateIds: string[];
  selectedIds: string[];
  stats: RotationStats;
}) {
  const selectedRepeats = selectedIds.some(
    (staffId) => getActivityRepeatCount(stats, staffId, activityKeys) > 0,
  );

  if (!selectedRepeats) {
    return false;
  }

  return candidateIds.length > 0 && candidateIds.every((staffId) => getActivityRepeatCount(stats, staffId, activityKeys) > 0);
}

function addPlannedAssignments(
  plannedAssignmentsByStaff: Map<string, number>,
  staffIds: string[],
  taskCount: number,
) {
  for (const staffId of staffIds) {
    plannedAssignmentsByStaff.set(
      staffId,
      (plannedAssignmentsByStaff.get(staffId) ?? 0) + taskCount,
    );
  }
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
        "id, task_name, staff_id, source_rule_task_id, source_master_task_id, is_manual_override, event_task_staff(staff_id, sort_order)",
      )
      .eq("event_id", id),
    supabaseAdmin.from("staff").select("id").eq("is_active", true).order("name", { ascending: true }),
  ]);

  if (isMissingRelationError(tasksResult.error)) {
    [tasksResult, staffResult] = await Promise.all([
      supabaseAdmin
        .from("event_tasks")
        .select("id, task_name, staff_id, source_rule_task_id, source_master_task_id, is_manual_override")
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
    return NextResponse.json({ error: "No se pudo cargar el personal seleccionable de reglas." }, { status: 500 });
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
        .select("id, name, default_staff_id, required_responsible_count, assignment_group_id, assignment_group_key, assignment_group_label, master_task_default_staff(staff_id, sort_order)")
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
    return NextResponse.json({ error: "No se pudo cargar el personal seleccionable de tareas maestras." }, { status: 500 });
  }

  const masterTasks = (masterTasksResult.data ?? []) as MasterTaskForAssignment[];
  const masterTaskById = new Map(masterTasks.map((masterTask) => [masterTask.id, masterTask]));
  const masterTaskByName = new Map(masterTasks.map((masterTask) => [normalizeName(masterTask.name), masterTask]));
  const taskContexts: TaskAssignmentContext[] = tasks.map((task) => {
    const ruleTask = task.source_rule_task_id ? ruleTaskById.get(task.source_rule_task_id) ?? null : null;
    const masterTaskId = task.source_master_task_id ?? ruleTask?.master_task_id ?? null;
    const masterTask = masterTaskId
      ? masterTaskById.get(masterTaskId) ?? masterTaskByName.get(normalizeName(task.task_name)) ?? null
      : masterTaskByName.get(normalizeName(task.task_name)) ?? null;
    const existing = getAssignedStaffIds(task.event_task_staff);

    if (existing.length === 0 && task.staff_id) {
      existing.push(task.staff_id);
    }

    const ruleSelectableStaffIds = getAssignedStaffIds(ruleTask?.questionnaire_task_rule_task_staff);
    const masterSelectableStaffIds = getAssignedStaffIds(masterTask?.master_task_default_staff);
    const legacyRuleSelectableStaffIds = ruleTask?.override_staff_id ? [ruleTask.override_staff_id] : [];
    const legacyMasterSelectableStaffIds = masterTask?.default_staff_id ? [masterTask.default_staff_id] : [];
    const selectableStaffIds =
      ruleSelectableStaffIds.length || legacyRuleSelectableStaffIds.length
        ? [...ruleSelectableStaffIds, ...legacyRuleSelectableStaffIds]
        : [...masterSelectableStaffIds, ...legacyMasterSelectableStaffIds];

    return {
      task,
      ruleTask,
      masterTask,
      existing,
      selectableStaffIds: Array.from(new Set(selectableStaffIds)),
      hasSelectableRestriction: selectableStaffIds.length > 0,
      requiredCount: masterTask?.required_responsible_count ?? 1,
      activity: resolveActivityIdentity({
        masterTask,
        sourceMasterTaskId: masterTaskId,
        taskName: task.task_name,
      }),
    };
  });
  const assignmentUnits = buildAssignmentUnits(taskContexts);
  const rotationResult = await loadRotationStatsForEvent(supabaseAdmin, id, 3);

  if (rotationResult.error) {
    return NextResponse.json({ error: "No se pudo cargar el historial reciente para rotar responsables." }, { status: 500 });
  }

  let updated = 0;
  let incomplete = 0;
  let unchanged = 0;
  let errors = 0;
  let unavoidableRepeats = 0;
  let candidateShortages = 0;
  const plannedAssignmentsByStaff = new Map<string, number>();

  for (const unit of assignmentUnits) {
    const requiredCount = Math.max(...unit.tasks.map((context) => context.requiredCount), 1);
    const unitRotationKeys = getUnitRotationKeys(unit);
    const candidateIds = getUnitCandidateIds(unit, activeStaffIds);
    const nextStaffIds = getUnitExistingIds({
      activityKeys: unitRotationKeys,
      candidateIds,
      mode,
      stats: rotationResult.stats,
      unit,
    });
    const unitActivity = getUnitActivity(unit);

    if (candidateIds.length < requiredCount) {
      candidateShortages += 1;
    }

    if (unitActivity) {
      const orderedCandidates = orderCandidatesByRotation({
        activityKeys: unitRotationKeys,
        candidateIds,
        existingIds: nextStaffIds,
        plannedAssignmentsByStaff,
        stats: rotationResult.stats,
      });

      addUnique(nextStaffIds, orderedCandidates, requiredCount);

      if (
        nextStaffIds.length > 0 &&
        hasUnavoidableRepeat({
          activityKeys: unitRotationKeys,
          candidateIds,
          selectedIds: nextStaffIds,
          stats: rotationResult.stats,
        })
      ) {
        unavoidableRepeats += 1;
      }
    } else {
      addUnique(nextStaffIds, shuffleIds(candidateIds), requiredCount);
    }

    if (nextStaffIds.length < requiredCount) {
      incomplete += 1;
    }

    const unitUnchanged = unit.tasks.every((context) => sameIds(context.existing, nextStaffIds));
    addPlannedAssignments(plannedAssignmentsByStaff, nextStaffIds, unit.tasks.length);

    if (mode === "complete" && unitUnchanged) {
      unchanged += unit.tasks.length;
      continue;
    }

    for (const { task } of unit.tasks) {
      const { error: updateError } = await supabaseAdmin
        .from("event_tasks")
        .update({
          staff_id: nextStaffIds[0] ?? null,
          is_manual_override: false,
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
  }

  return NextResponse.json({
    updated,
    incomplete,
    unchanged,
    errors,
    mode,
    unavoidableRepeats,
    candidateShortages,
    historyEvents: rotationResult.events.length,
  });
}
