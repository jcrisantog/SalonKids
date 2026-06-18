import { getAssignedStaffIds, type StaffAssignmentMember } from "@/lib/staff-assignments";
import type { supabaseAdmin } from "@/lib/supabase-server";

type SupabaseClientLike = typeof supabaseAdmin;

type QueryError = { code?: string; message?: string; details?: string } | null;

type EventSummary = {
  id: string;
  celebratory_name: string;
  event_date: string;
  start_time: string;
  end_time?: string | null;
};

export type StaffSummary = {
  id: string;
  name: string;
  primary_role: string | null;
  is_active: boolean;
};

export type MasterTaskActivitySource = {
  id: string;
  name: string;
  assignment_group_id?: string | null;
  assignment_group_key?: string | null;
  assignment_group_label?: string | null;
};

type EventTaskHistoryRow = {
  id: string;
  event_id: string;
  task_name: string;
  scheduled_time: string | null;
  status: string | null;
  staff_id: string | null;
  source_master_task_id: string | null;
  event_task_staff?: StaffAssignmentMember[] | null;
};

export type ActivityIdentity = {
  key: string;
  keys: string[];
  label: string;
  source: "group" | "legacy_group" | "master_task" | "task_name";
};

export type StaffTaskHistoryEntry = {
  id: string;
  event: EventSummary;
  staffId: string;
  taskName: string;
  scheduledTime: string | null;
  status: string | null;
  activity: ActivityIdentity;
};

export type StaffTaskHistoryMember = {
  staff: StaffSummary;
  entries: StaffTaskHistoryEntry[];
  summary: Array<{
    activityKey: string;
    activityLabel: string;
    count: number;
  }>;
};

export type RotationStats = {
  eventCount: number;
  sameActivityByStaff: Map<string, Map<string, number>>;
  totalAssignmentsByStaff: Map<string, number>;
};

function uniqueKeys(keys: Array<string | null | undefined>) {
  return Array.from(new Set(keys.filter(Boolean) as string[]));
}

function taskNameKey(taskName: string) {
  return `task:${normalizeActivityName(taskName) || "sin-nombre"}`;
}

function normalizeActivityName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function compareEventDateTime(a: Pick<EventSummary, "event_date" | "start_time">, b: Pick<EventSummary, "event_date" | "start_time">) {
  const dateComparison = a.event_date.localeCompare(b.event_date);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return a.start_time.localeCompare(b.start_time);
}

function getTaskStaffIds(task: EventTaskHistoryRow) {
  const relationIds = getAssignedStaffIds(task.event_task_staff);

  if (relationIds.length > 0) {
    return relationIds;
  }

  return task.staff_id ? [task.staff_id] : [];
}

export function resolveActivityIdentity({
  masterTask,
  sourceMasterTaskId,
  taskName,
}: {
  masterTask?: MasterTaskActivitySource | null;
  sourceMasterTaskId?: string | null;
  taskName: string;
}): ActivityIdentity {
  const groupId = masterTask?.assignment_group_id?.trim();
  const groupKey = masterTask?.assignment_group_key?.trim();
  const masterId = sourceMasterTaskId?.trim() || masterTask?.id?.trim();
  const fallbackTaskKey = taskNameKey(taskName);

  if (groupId) {
    return {
      key: `group-id:${groupId}`,
      keys: uniqueKeys([`group-id:${groupId}`, groupKey ? `group-key:${groupKey}` : null, masterId ? `master:${masterId}` : null, fallbackTaskKey]),
      label: masterTask?.assignment_group_label?.trim() || masterTask?.name || taskName,
      source: "group",
    };
  }

  if (groupKey) {
    return {
      key: `group-key:${groupKey}`,
      keys: uniqueKeys([`group-key:${groupKey}`, masterId ? `master:${masterId}` : null, fallbackTaskKey]),
      label: masterTask?.assignment_group_label?.trim() || groupKey,
      source: "legacy_group",
    };
  }

  if (masterId) {
    return {
      key: `master:${masterId}`,
      keys: uniqueKeys([`master:${masterId}`, fallbackTaskKey]),
      label: masterTask?.name || taskName,
      source: "master_task",
    };
  }

  return {
    key: fallbackTaskKey,
    keys: [fallbackTaskKey],
    label: taskName,
    source: "task_name",
  };
}

export async function loadRecentEventsBefore(
  supabase: SupabaseClientLike,
  eventId: string,
  limit: number,
) {
  const currentResult = await supabase
    .from("events")
    .select("id, celebratory_name, event_date, start_time, end_time")
    .eq("id", eventId)
    .single();

  if (currentResult.error || !currentResult.data) {
    return { events: [] as EventSummary[], error: currentResult.error as QueryError };
  }

  const eventsResult = await supabase
    .from("events")
    .select("id, celebratory_name, event_date, start_time, end_time")
    .order("event_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(Math.max(limit * 20, 50));

  if (eventsResult.error) {
    return { events: [] as EventSummary[], error: eventsResult.error as QueryError };
  }

  const current = currentResult.data as EventSummary;
  const candidates = ((eventsResult.data ?? []) as EventSummary[]).filter((event) => event.id !== eventId);
  const previousEvents = candidates.filter((event) => compareEventDateTime(event, current) < 0);
  const events = [...previousEvents, ...candidates.filter((event) => !previousEvents.some((previous) => previous.id === event.id))]
    .slice(0, limit);

  return { events, error: null };
}

export async function loadRecentEvents(supabase: SupabaseClientLike, limit: number) {
  const eventsResult = await supabase
    .from("events")
    .select("id, celebratory_name, event_date, start_time, end_time")
    .order("event_date", { ascending: false })
    .order("start_time", { ascending: false })
    .limit(limit);

  if (eventsResult.error) {
    return { events: [] as EventSummary[], error: eventsResult.error as QueryError };
  }

  return { events: (eventsResult.data ?? []) as EventSummary[], error: null };
}

async function loadMasterTasksForRows(supabase: SupabaseClientLike, rows: EventTaskHistoryRow[]) {
  const ids = Array.from(new Set(rows.map((row) => row.source_master_task_id).filter(Boolean) as string[]));
  const names = Array.from(new Set(rows.map((row) => row.task_name).filter(Boolean)));

  if (ids.length === 0 && names.length === 0) {
    return { byId: new Map<string, MasterTaskActivitySource>(), byName: new Map<string, MasterTaskActivitySource>(), error: null };
  }

  const masterResult = await supabase
    .from("master_tasks")
    .select("id, name, assignment_group_id, assignment_group_key, assignment_group_label")
    .or(
      [
        ids.length ? `id.in.(${ids.join(",")})` : "",
        names.length ? `name.in.(${names.map((name) => `"${name.replace(/"/g, '\\"')}"`).join(",")})` : "",
      ]
        .filter(Boolean)
        .join(","),
    );

  if (masterResult.error) {
    return { byId: new Map<string, MasterTaskActivitySource>(), byName: new Map<string, MasterTaskActivitySource>(), error: masterResult.error as QueryError };
  }

  const masterTasks = (masterResult.data ?? []) as MasterTaskActivitySource[];

  return {
    byId: new Map(masterTasks.map((task) => [task.id, task])),
    byName: new Map(masterTasks.map((task) => [normalizeActivityName(task.name), task])),
    error: null,
  };
}

export async function loadTaskHistoryForEvents(
  supabase: SupabaseClientLike,
  events: EventSummary[],
) {
  const eventIds = events.map((event) => event.id);

  if (eventIds.length === 0) {
    return { entries: [] as StaffTaskHistoryEntry[], error: null };
  }

  const tasksResult = await supabase
    .from("event_tasks")
    .select("id, event_id, task_name, scheduled_time, status, staff_id, source_master_task_id, event_task_staff(staff_id, sort_order)")
    .in("event_id", eventIds);

  if (tasksResult.error) {
    return { entries: [] as StaffTaskHistoryEntry[], error: tasksResult.error as QueryError };
  }

  const rows = (tasksResult.data ?? []) as EventTaskHistoryRow[];
  const masterTasks = await loadMasterTasksForRows(supabase, rows);

  if (masterTasks.error) {
    return { entries: [] as StaffTaskHistoryEntry[], error: masterTasks.error };
  }

  const eventById = new Map(events.map((event) => [event.id, event]));
  const entries: StaffTaskHistoryEntry[] = [];

  for (const row of rows) {
    const event = eventById.get(row.event_id);

    if (!event) {
      continue;
    }

    const masterTask = row.source_master_task_id
      ? masterTasks.byId.get(row.source_master_task_id) ?? masterTasks.byName.get(normalizeActivityName(row.task_name)) ?? null
      : masterTasks.byName.get(normalizeActivityName(row.task_name)) ?? null;
    const activity = resolveActivityIdentity({
      masterTask,
      sourceMasterTaskId: row.source_master_task_id,
      taskName: row.task_name,
    });

    for (const staffId of getTaskStaffIds(row)) {
      entries.push({
        id: `${row.id}:${staffId}`,
        event,
        staffId,
        taskName: row.task_name,
        scheduledTime: row.scheduled_time,
        status: row.status,
        activity,
      });
    }
  }

  entries.sort((a, b) => {
    const eventComparison = compareEventDateTime(b.event, a.event);

    if (eventComparison !== 0) {
      return eventComparison;
    }

    return (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? "");
  });

  return { entries, error: null };
}

export function buildRotationStats(entries: StaffTaskHistoryEntry[], eventCount: number): RotationStats {
  const sameActivityByStaff = new Map<string, Map<string, number>>();
  const totalAssignmentsByStaff = new Map<string, number>();

  for (const entry of entries) {
    const activityCounts = sameActivityByStaff.get(entry.staffId) ?? new Map<string, number>();

    for (const activityKey of entry.activity.keys) {
      activityCounts.set(activityKey, (activityCounts.get(activityKey) ?? 0) + 1);
    }
    sameActivityByStaff.set(entry.staffId, activityCounts);
    totalAssignmentsByStaff.set(entry.staffId, (totalAssignmentsByStaff.get(entry.staffId) ?? 0) + 1);
  }

  return { eventCount, sameActivityByStaff, totalAssignmentsByStaff };
}

export async function loadRotationStatsForEvent(
  supabase: SupabaseClientLike,
  eventId: string,
  limit = 3,
) {
  const eventsResult = await loadRecentEventsBefore(supabase, eventId, limit);

  if (eventsResult.error) {
    return { stats: buildRotationStats([], 0), events: [] as EventSummary[], error: eventsResult.error };
  }

  const historyResult = await loadTaskHistoryForEvents(supabase, eventsResult.events);

  if (historyResult.error) {
    return { stats: buildRotationStats([], eventsResult.events.length), events: eventsResult.events, error: historyResult.error };
  }

  return {
    stats: buildRotationStats(historyResult.entries, eventsResult.events.length),
    events: eventsResult.events,
    error: null,
  };
}

function summarizeEntries(entries: StaffTaskHistoryEntry[]) {
  const summaryByActivity = new Map<string, { activityKey: string; activityLabel: string; count: number }>();

  for (const entry of entries) {
    const existing = summaryByActivity.get(entry.activity.key) ?? {
      activityKey: entry.activity.key,
      activityLabel: entry.activity.label,
      count: 0,
    };

    existing.count += 1;
    summaryByActivity.set(entry.activity.key, existing);
  }

  return Array.from(summaryByActivity.values()).sort((a, b) => b.count - a.count || a.activityLabel.localeCompare(b.activityLabel));
}

export async function loadStaffTaskHistory(
  supabase: SupabaseClientLike,
  options: {
    eventId?: string | null;
    staffId?: string | null;
    limit?: number;
  } = {},
) {
  const limit = options.limit ?? 5;
  const eventsResult = await loadRecentEvents(supabase, limit);

  if (eventsResult.error) {
    return { events: [] as EventSummary[], members: [] as StaffTaskHistoryMember[], error: eventsResult.error };
  }

  const events = options.eventId
    ? eventsResult.events.filter((event) => event.id === options.eventId)
    : eventsResult.events;
  const [historyResult, staffResult] = await Promise.all([
    loadTaskHistoryForEvents(supabase, events),
    supabase.from("staff").select("id, name, primary_role, is_active").order("name", { ascending: true }),
  ]);

  if (historyResult.error) {
    return { events: eventsResult.events, members: [] as StaffTaskHistoryMember[], error: historyResult.error };
  }

  if (staffResult.error) {
    return { events: eventsResult.events, members: [] as StaffTaskHistoryMember[], error: staffResult.error as QueryError };
  }

  const entriesByStaff = new Map<string, StaffTaskHistoryEntry[]>();

  for (const entry of historyResult.entries) {
    const entries = entriesByStaff.get(entry.staffId) ?? [];

    entries.push(entry);
    entriesByStaff.set(entry.staffId, entries);
  }

  const assignedStaffIds = new Set(historyResult.entries.map((entry) => entry.staffId));
  const staff = ((staffResult.data ?? []) as StaffSummary[])
    .filter((member) => member.is_active || assignedStaffIds.has(member.id))
    .filter((member) => !options.staffId || member.id === options.staffId);
  const members = staff.map((member) => {
    const entries = entriesByStaff.get(member.id) ?? [];

    return {
      staff: member,
      entries,
      summary: summarizeEntries(entries),
    };
  });

  return {
    events: eventsResult.events,
    members,
    error: null,
  };
}
