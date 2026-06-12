import { supabaseAdmin } from "@/lib/supabase-server";

type RelationTable =
  | "master_task_default_staff"
  | "questionnaire_task_rule_task_staff"
  | "event_task_staff";

type RelationOwnerColumn = "master_task_id" | "rule_task_id" | "event_task_id";

type ReplaceRelationOptions = {
  table: RelationTable;
  ownerColumn: RelationOwnerColumn;
  ownerId: string;
  staffIds: string[];
};

export type StaffAssignmentMember = {
  staff_id: string;
  sort_order?: number | null;
  staff?: {
    id: string;
    name: string;
    primary_role: string;
    is_active: boolean;
  } | null;
};

export function normalizeStaffIds(value: unknown): string[] {
  const rawValues = Array.isArray(value) ? value : value ? [value] : [];
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const item of rawValues) {
    if (typeof item !== "string") {
      continue;
    }

    const id = item.trim();

    if (!id || seen.has(id)) {
      continue;
    }

    seen.add(id);
    ids.push(id);
  }

  return ids;
}

export function normalizeRequiredResponsibleCount(value: unknown) {
  const parsed = Number(value ?? 1);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}

export async function validateStaffIds(staffIds: string[]) {
  if (staffIds.length === 0) {
    return null;
  }

  const { data, error } = await supabaseAdmin.from("staff").select("id").in("id", staffIds);

  if (error || (data ?? []).length !== staffIds.length) {
    return "Selecciona responsables validos del catalogo de personal.";
  }

  return null;
}

export async function replaceStaffRelations({
  ownerColumn,
  ownerId,
  staffIds,
  table,
}: ReplaceRelationOptions) {
  const { error: deleteError } = await supabaseAdmin.from(table).delete().eq(ownerColumn, ownerId);

  if (deleteError) {
    if (isMissingRelationError(deleteError)) {
      return null;
    }

    return deleteError;
  }

  if (staffIds.length === 0) {
    return null;
  }

  const rows = staffIds.map((staffId, index) => ({
    [ownerColumn]: ownerId,
    staff_id: staffId,
    sort_order: index,
  }));
  const { error } = await supabaseAdmin.from(table).insert(rows);

  if (error && isMissingRelationError(error)) {
    return null;
  }

  return error;
}

export function getAssignedStaffIds(relations?: StaffAssignmentMember[] | null) {
  return [...(relations ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((relation) => relation.staff_id)
    .filter(Boolean);
}

export function isMissingRelationError(error: { code?: string; message?: string; details?: string } | null) {
  if (!error) {
    return false;
  }

  const text = `${error.code ?? ""} ${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();

  return (
    text.includes("could not find") ||
    text.includes("not find") ||
    text.includes("does not exist") ||
    text.includes("schema cache") ||
    text.includes("relationship")
  );
}
