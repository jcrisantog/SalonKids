import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { getQuestionnaireFieldCatalog } from "@/lib/questionnaire-schema";
import { normalizeSelectableStaffIds, replaceStaffRelations, validateStaffIds } from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { QuestionnaireRuleOperator } from "@/lib/rule-engine";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type RuleTaskPayload = {
  master_task_id?: string;
  override_description?: string;
  override_scheduled_time?: string;
  schedule_source_field_key?: string | null;
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

function cleanText(value?: string) {
  return value?.trim() || null;
}

function getFieldMetadata(fieldKey?: string) {
  return getQuestionnaireFieldCatalog().find((field) => field.key === fieldKey);
}

function normalizeTime(value?: string) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

async function validateRuleStaffIds(tasks: RuleTaskPayload[]) {
  const staffIds = Array.from(
    new Set(tasks.flatMap((task) => normalizeSelectableStaffIds(task.override_staff_ids ?? task.override_staff_id))),
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

  const invalidScheduleSource = tasks.find((task) => {
    const sourceFieldKey = cleanText(task.schedule_source_field_key ?? undefined);

    return sourceFieldKey && !getFieldMetadata(sourceFieldKey);
  });

  if (invalidScheduleSource) {
    return { error: "Selecciona una fuente de horario valida.", field: null };
  }

  return { error: null, field, tasks };
}

export async function PATCH(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const payload = (await request.json()) as RulePayload;
  const validation = validatePayload(payload);

  if (validation.error || !validation.field) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const staffError = await validateRuleStaffIds(validation.tasks ?? []);

  if (staffError) {
    return NextResponse.json({ error: staffError }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("questionnaire_task_rules")
    .update({
      field_key: validation.field.key,
      field_label: validation.field.label,
      section_id: validation.field.sectionId,
      section_title: validation.field.sectionTitle,
      operator: payload.operator,
      expected_value: payload.expected_value ?? null,
      is_active: payload.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "No se pudo actualizar la regla." }, { status: 500 });
  }

  const { error: deleteTasksError } = await supabaseAdmin
    .from("questionnaire_task_rule_tasks")
    .delete()
    .eq("rule_id", id);

  if (deleteTasksError) {
    return NextResponse.json({ error: "No se pudieron reemplazar las tareas." }, { status: 500 });
  }

  const relationRows = (validation.tasks ?? []).map((task, index) => {
    const selectableStaffIds = normalizeSelectableStaffIds(task.override_staff_ids ?? task.override_staff_id);

    return {
      rule_id: id,
      master_task_id: task.master_task_id,
      override_description: cleanText(task.override_description),
      override_scheduled_time: normalizeTime(task.override_scheduled_time),
      schedule_source_field_key: cleanText(task.schedule_source_field_key ?? undefined),
      override_role_responsible: cleanText(task.override_role_responsible),
      override_staff_id: selectableStaffIds[0] ?? null,
      override_visibility: task.override_visibility || null,
      sort_order: index,
    };
  });

  const { data: insertedTasks, error: insertTasksError } = await supabaseAdmin
    .from("questionnaire_task_rule_tasks")
    .insert(relationRows)
    .select("id, sort_order");

  if (insertTasksError) {
    return NextResponse.json({ error: "No se pudieron asociar las tareas. Verifica que no esten duplicadas." }, { status: 500 });
  }

  for (const relation of insertedTasks ?? []) {
    const taskPayload = (validation.tasks ?? [])[relation.sort_order ?? 0];
    const selectableStaffIds = normalizeSelectableStaffIds(taskPayload?.override_staff_ids ?? taskPayload?.override_staff_id);
    const relationError = await replaceStaffRelations({
      table: "questionnaire_task_rule_task_staff",
      ownerColumn: "rule_task_id",
      ownerId: relation.id,
      staffIds: selectableStaffIds,
    });

    if (relationError) {
      return NextResponse.json({ error: "No se pudo guardar el personal seleccionable de la regla." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const { error } = await supabaseAdmin.from("questionnaire_task_rules").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar la regla." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
