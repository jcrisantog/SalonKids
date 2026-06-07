import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { getQuestionnaireFieldCatalog } from "@/lib/questionnaire-schema";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { QuestionnaireRuleOperator } from "@/lib/rule-engine";

type RuleTaskPayload = {
  master_task_id?: string;
  override_description?: string;
  override_scheduled_time?: string;
  override_role_responsible?: string;
  override_staff_id?: string | null;
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

async function validateStaffIds(tasks: RuleTaskPayload[]) {
  const staffIds = Array.from(
    new Set(tasks.map((task) => task.override_staff_id).filter(Boolean) as string[]),
  );

  if (staffIds.length === 0) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("staff")
    .select("id")
    .in("id", staffIds);

  if (error || (data ?? []).length !== staffIds.length) {
    return "Selecciona responsables validos del catalogo de personal.";
  }

  return null;
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

  const [rulesResult, tasksResult, staffResult] = await Promise.all([
    supabaseAdmin
      .from("questionnaire_task_rules")
      .select(
        "id, field_key, field_label, section_id, section_title, operator, expected_value, is_active, created_at, updated_at, questionnaire_task_rule_tasks(id, master_task_id, override_description, override_scheduled_time, override_role_responsible, override_staff_id, override_visibility, sort_order, master_tasks(id, name, base_description, visibility, area, default_role, default_staff_id))",
      )
      .order("section_title", { ascending: true })
      .order("field_label", { ascending: true })
      .order("sort_order", { ascending: true, foreignTable: "questionnaire_task_rule_tasks" }),
    supabaseAdmin
      .from("master_tasks")
      .select("id, name, base_description, visibility, area, default_role, default_staff_id")
      .order("area", { ascending: true })
      .order("name", { ascending: true }),
    supabaseAdmin
      .from("staff")
      .select("id, name, primary_role, is_active")
      .order("name", { ascending: true }),
  ]);

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

  const staffError = await validateStaffIds(validation.tasks ?? []);

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

  const relationRows = (validation.tasks ?? []).map((task, index) => ({
    rule_id: rule.id,
    master_task_id: task.master_task_id,
    override_description: cleanText(task.override_description),
    override_scheduled_time: normalizeTime(task.override_scheduled_time),
    override_role_responsible: cleanText(task.override_role_responsible),
    override_staff_id: task.override_staff_id || null,
    override_visibility: task.override_visibility || null,
    sort_order: index,
  }));

  const { error: tasksError } = await supabaseAdmin
    .from("questionnaire_task_rule_tasks")
    .insert(relationRows);

  if (tasksError) {
    await supabaseAdmin.from("questionnaire_task_rules").delete().eq("id", rule.id);
    return NextResponse.json({ error: "No se pudieron asociar las tareas. Verifica que no esten duplicadas." }, { status: 500 });
  }

  return NextResponse.json({ rule: { id: rule.id } }, { status: 201 });
}
