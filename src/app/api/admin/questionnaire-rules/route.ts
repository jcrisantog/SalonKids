import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { getQuestionnaireFieldCatalog } from "@/lib/questionnaire-schema";
import {
  isMissingRelationError,
  normalizeStaffIds,
  replaceStaffRelations,
  validateStaffIds,
} from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { QuestionnaireRuleOperator } from "@/lib/rule-engine";

type RuleTaskPayload = {
  master_task_id?: string;
  override_description?: string;
  override_scheduled_time?: string;
  override_role_responsible?: string;
  override_staff_id?: string | null;
  override_staff_ids?: string[];
  override_visibility?: "interna" | "publica" | "";
  sort_order?: number;
};

type RulePayload = {
  field_key?: string;
  operator?: QuestionnaireRuleOperator;
  expected_value?: string | number | boolean | string[] | null;
  is_active?: boolean;
  tasks?: RuleTaskPayload[];
};

const validOperators: QuestionnaireRuleOperator[] = [
  "answered",
  "equals",
  "not_equals",
  "is_true",
  "is_false",
  "greater_than",
  "contains",
];

const rulesSelect =
  "id, field_key, field_label, section_id, section_title, operator, expected_value, is_active, created_at, updated_at, questionnaire_task_rule_tasks(id, master_task_id, override_description, override_scheduled_time, override_role_responsible, override_staff_id, override_visibility, sort_order, questionnaire_task_rule_task_staff(staff_id, sort_order, staff(id, name, primary_role, is_active)), master_tasks(id, name, base_description, visibility, area, default_role, default_staff_id, required_responsible_count, master_task_default_staff(staff_id, sort_order, staff(id, name, primary_role, is_active))))";
const legacyRulesSelect =
  "id, field_key, field_label, section_id, section_title, operator, expected_value, is_active, created_at, updated_at, questionnaire_task_rule_tasks(id, master_task_id, override_description, override_scheduled_time, override_role_responsible, override_staff_id, override_visibility, sort_order, master_tasks(id, name, base_description, visibility, area, default_role, default_staff_id))";
const masterTasksSelect =
  "id, name, base_description, visibility, area, default_role, default_staff_id, required_responsible_count, master_task_default_staff(staff_id, sort_order, staff(id, name, primary_role, is_active))";
const legacyMasterTasksSelect = "id, name, base_description, visibility, area, default_role, default_staff_id";

type QueryError = { code?: string; message?: string; details?: string } | null;
type QueryResult<T> = {
  data: T[] | null;
  error: QueryError;
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

function getFieldMetadata(fieldKey?: string) {
  return getQuestionnaireFieldCatalog().find((field) => field.key === fieldKey);
}

async function validateRuleStaffIds(tasks: RuleTaskPayload[]) {
  const staffIds = Array.from(
    new Set(tasks.flatMap((task) => normalizeStaffIds(task.override_staff_ids ?? task.override_staff_id))),
  );

  return validateStaffIds(staffIds);
}

function validatePayload(payload: RulePayload) {
  const field = getFieldMetadata(payload.field_key);

  if (!field) {
    return { error: "Selecciona una pregunta valida.", field: null };
  }

  if (!payload.operator || !validOperators.includes(payload.operator)) {
    return { error: "Selecciona un operador valido.", field: null };
  }

  const tasks = (payload.tasks ?? []).filter((task) => task.master_task_id);

  if (tasks.length === 0) {
    return { error: "Selecciona al menos una tarea maestra.", field: null };
  }

  const taskIds = tasks.map((task) => task.master_task_id);
  const uniqueTaskIds = new Set(taskIds);

  if (uniqueTaskIds.size !== taskIds.length) {
    return { error: "No puedes asociar la misma tarea maestra mas de una vez en la misma regla.", field: null };
  }

  return { error: null, field, tasks };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  let [rulesResult, tasksResult, staffResult]: [
    QueryResult<unknown>,
    QueryResult<unknown>,
    QueryResult<unknown>,
  ] = await Promise.all([
    supabaseAdmin
      .from("questionnaire_task_rules")
      .select(rulesSelect)
      .order("section_title", { ascending: true })
      .order("field_label", { ascending: true })
      .order("sort_order", { ascending: true, foreignTable: "questionnaire_task_rule_tasks" }),
    supabaseAdmin
      .from("master_tasks")
      .select(masterTasksSelect)
      .order("area", { ascending: true })
      .order("name", { ascending: true }),
    supabaseAdmin
      .from("staff")
      .select("id, name, primary_role, is_active")
      .order("name", { ascending: true }),
  ]);

  if (isMissingRelationError(rulesResult.error) || isMissingRelationError(tasksResult.error)) {
    [rulesResult, tasksResult, staffResult] = await Promise.all([
      supabaseAdmin
        .from("questionnaire_task_rules")
        .select(legacyRulesSelect)
        .order("section_title", { ascending: true })
        .order("field_label", { ascending: true })
        .order("sort_order", { ascending: true, foreignTable: "questionnaire_task_rule_tasks" }),
      supabaseAdmin
        .from("master_tasks")
        .select(legacyMasterTasksSelect)
        .order("area", { ascending: true })
        .order("name", { ascending: true }),
      supabaseAdmin
        .from("staff")
        .select("id, name, primary_role, is_active")
        .order("name", { ascending: true }),
    ]);
  }

  if (rulesResult.error || tasksResult.error || staffResult.error) {
    return NextResponse.json({ error: "No se pudieron cargar las reglas." }, { status: 500 });
  }

  return NextResponse.json({
    rules: rulesResult.data ?? [],
    masterTasks: tasksResult.data ?? [],
    staff: staffResult.data ?? [],
    fields: getQuestionnaireFieldCatalog(),
    operators: validOperators,
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const payload = (await request.json()) as RulePayload;
  const validation = validatePayload(payload);

  if (validation.error || !validation.field) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const staffError = await validateRuleStaffIds(validation.tasks ?? []);

  if (staffError) {
    return NextResponse.json({ error: staffError }, { status: 400 });
  }

  const { data: rule, error: ruleError } = await supabaseAdmin
    .from("questionnaire_task_rules")
    .insert({
      field_key: validation.field.key,
      field_label: validation.field.label,
      section_id: validation.field.sectionId,
      section_title: validation.field.sectionTitle,
      operator: payload.operator,
      expected_value: payload.expected_value ?? null,
      is_active: payload.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (ruleError || !rule) {
    return NextResponse.json({ error: "No se pudo crear la regla." }, { status: 500 });
  }

  const relationRows = (validation.tasks ?? []).map((task, index) => {
    const overrideStaffIds = normalizeStaffIds(task.override_staff_ids ?? task.override_staff_id);

    return {
    rule_id: rule.id,
    master_task_id: task.master_task_id,
    override_description: cleanText(task.override_description),
    override_scheduled_time: normalizeTime(task.override_scheduled_time),
    override_role_responsible: cleanText(task.override_role_responsible),
    override_staff_id: overrideStaffIds[0] ?? null,
    override_visibility: task.override_visibility || null,
    sort_order: index,
    };
  });

  const { data: insertedTasks, error: tasksError } = await supabaseAdmin
    .from("questionnaire_task_rule_tasks")
    .insert(relationRows)
    .select("id, sort_order");

  if (tasksError) {
    await supabaseAdmin.from("questionnaire_task_rules").delete().eq("id", rule.id);
    return NextResponse.json({ error: "No se pudieron asociar las tareas. Verifica que no esten duplicadas." }, { status: 500 });
  }

  for (const relation of insertedTasks ?? []) {
    const taskPayload = (validation.tasks ?? [])[relation.sort_order ?? 0];
    const overrideStaffIds = normalizeStaffIds(taskPayload?.override_staff_ids ?? taskPayload?.override_staff_id);
    const relationError = await replaceStaffRelations({
      table: "questionnaire_task_rule_task_staff",
      ownerColumn: "rule_task_id",
      ownerId: relation.id,
      staffIds: overrideStaffIds,
    });

    if (relationError) {
      await supabaseAdmin.from("questionnaire_task_rules").delete().eq("id", rule.id);
      return NextResponse.json({ error: "No se pudieron guardar los responsables override." }, { status: 500 });
    }
  }

  return NextResponse.json({ rule: { id: rule.id } }, { status: 201 });
}
