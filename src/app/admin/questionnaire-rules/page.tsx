"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { matchesSearch, normalizeSearchText } from "@/lib/search";
import type { QuestionnaireRuleOperator } from "@/lib/rule-engine";

type FieldOption = {
  sectionId: string;
  sectionTitle: string;
  key: string;
  label: string;
  type: string;
  options: string[];
};

type MasterTask = {
  id: string;
  name: string;
  base_description: string | null;
  visibility: "interna" | "publica";
  area: string | null;
  default_role: string | null;
  default_staff_id: string | null;
  default_staff_ids?: string[];
  required_responsible_count: number;
  assignment_group_id: string | null;
  assignment_group_key: string | null;
  assignment_group_label: string | null;
  task_groups?: TaskGroup | null;
  master_task_default_staff?: Array<{
    staff_id: string;
    sort_order: number | null;
    staff?: StaffMember | null;
  }>;
};

type StaffMember = {
  id: string;
  name: string;
  primary_role: string;
  is_active: boolean;
};

type TaskGroup = {
  id: string;
  name: string;
  key: string;
  description?: string | null;
  is_active: boolean;
  sort_order?: number | null;
};

type RuleTask = {
  id?: string;
  master_task_id: string;
  override_description: string;
  override_scheduled_time: string;
  schedule_source_field_key: string;
  override_role_responsible: string;
  override_staff_id: string;
  override_staff_ids: string[];
  questionnaire_task_rule_task_staff?: Array<{
    staff_id: string;
    sort_order: number | null;
    staff?: StaffMember | null;
  }>;
  override_visibility: "" | "interna" | "publica";
  sort_order: number;
  master_tasks?: MasterTask | null;
};

type QuestionnaireRule = {
  id: string;
  field_key: string;
  field_label: string;
  section_id: string;
  section_title: string;
  operator: QuestionnaireRuleOperator;
  expected_value: string | number | boolean | string[] | null;
  is_active: boolean;
  questionnaire_task_rule_tasks: Array<RuleTask & { master_tasks: MasterTask | null }>;
};

type RuleForm = {
  field_key: string;
  operator: QuestionnaireRuleOperator;
  expected_value: string;
  is_active: boolean;
  tasks: RuleTask[];
};

type TaskCreationForm = {
  name: string;
  base_description: string;
  visibility: "interna" | "publica";
  default_staff_ids: string[];
  required_responsible_count: string;
  assignment_group_id: string;
};

const operatorLabels: Record<QuestionnaireRuleOperator, string> = {
  answered: "Tiene respuesta",
  equals: "Igual a",
  not_equals: "Distinto de",
  is_true: "Es verdadero",
  is_false: "Es falso",
  greater_than: "Mayor que",
  contains: "Contiene",
};

const operatorOptions = Object.keys(operatorLabels) as QuestionnaireRuleOperator[];

const emptyTask: RuleTask = {
  master_task_id: "",
  override_description: "",
  override_scheduled_time: "",
  schedule_source_field_key: "",
  override_role_responsible: "",
  override_staff_id: "",
  override_staff_ids: [],
  override_visibility: "",
  sort_order: 0,
};

const emptyForm: RuleForm = {
  field_key: "",
  operator: "answered",
  expected_value: "",
  is_active: true,
  tasks: [{ ...emptyTask }],
};

const emptyTaskCreationForm: TaskCreationForm = {
  name: "",
  base_description: "",
  visibility: "interna",
  default_staff_ids: [],
  required_responsible_count: "1",
  assignment_group_id: "",
};

function getSelectValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function getRelationStaffIds(
  relations?: Array<{ staff_id: string; sort_order: number | null }> | null,
  fallback?: string | null,
) {
  const ids = [...(relations ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((relation) => relation.staff_id)
    .filter(Boolean);

  return ids.length ? ids : fallback ? [fallback] : [];
}

function getStaffNames(ids: string[], staffById: Map<string, StaffMember>) {
  return ids.map((id) => staffById.get(id)?.name ?? "Personal no encontrado").join(", ");
}

function sortMasterTasks(tasks: MasterTask[]) {
  return [...tasks].sort((a, b) => {
    const areaComparison = (a.area ?? "").localeCompare(b.area ?? "");

    if (areaComparison !== 0) {
      return areaComparison;
    }

    return a.name.localeCompare(b.name);
  });
}

export default function QuestionnaireRulesPage() {
  const [rules, setRules] = useState<QuestionnaireRule[]>([]);
  const [fields, setFields] = useState<FieldOption[]>([]);
  const [masterTasks, setMasterTasks] = useState<MasterTask[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionnaireRule | null>(null);
  const [filterSection, setFilterSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskModalIndex, setTaskModalIndex] = useState<number | null>(null);
  const [taskCreationForm, setTaskCreationForm] = useState<TaskCreationForm>(emptyTaskCreationForm);
  const [taskCreationSaving, setTaskCreationSaving] = useState(false);
  const [taskCreationError, setTaskCreationError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const adminFetch = useCallback(async (path: string, init?: RequestInit) => {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Ocurrio un error.");
    }

    return payload;
  }, []);

  const loadRules = useCallback(async () => {
    setError(null);
    const payload = await adminFetch("/api/admin/questionnaire-rules");
    setRules(payload.rules ?? []);
    setFields(payload.fields ?? []);
    setMasterTasks(payload.masterTasks ?? []);
    setStaff(payload.staff ?? []);
    setTaskGroups(payload.taskGroups ?? []);
  }, [adminFetch]);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        await loadRules();
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las reglas.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [loadRules]);

  const sections = useMemo(() => {
    const unique = new Map<string, string>();
    fields.forEach((field) => unique.set(field.sectionId, field.sectionTitle));
    return Array.from(unique.entries()).map(([id, title]) => ({ id, title }));
  }, [fields]);

  const hasSearch = normalizeSearchText(searchQuery).length > 0;
  const filteredRules = useMemo(
    () =>
      rules.filter((rule) => {
        const matchesSection = !filterSection || rule.section_id === filterSection;
        const taskNames = rule.questionnaire_task_rule_tasks.map(
          (task) => task.master_tasks?.name ?? "Tarea sin catalogo",
        );
        const matchesQuery = matchesSearch(searchQuery, [
          rule.field_label,
          rule.field_key,
          rule.section_title,
          operatorLabels[rule.operator],
          rule.operator,
          rule.expected_value,
          rule.is_active ? "Activa" : "Inactiva",
          ...taskNames,
        ]);

        return matchesSection && matchesQuery;
      }),
    [filterSection, rules, searchQuery],
  );

  const selectedField = fields.find((field) => field.key === form.field_key);
  const selectedTaskIds = form.tasks
    .map((task) => task.master_task_id)
    .filter(Boolean);
  const duplicateTaskIds = selectedTaskIds.filter(
    (taskId, index) => selectedTaskIds.indexOf(taskId) !== index,
  );
  const hasDuplicateTasks = duplicateTaskIds.length > 0;
  const selectedTaskNames = form.tasks
    .map((task) => masterTasks.find((masterTask) => masterTask.id === task.master_task_id)?.name)
    .filter(Boolean) as string[];
  const sortedStaff = useMemo(
    () =>
      [...staff].sort((a, b) => {
        if (a.is_active !== b.is_active) {
          return a.is_active ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
      }),
    [staff],
  );
  const activeTaskGroups = useMemo(
    () =>
      [...taskGroups]
        .filter((group) => group.is_active)
        .sort((a, b) => {
          const orderComparison = (a.sort_order ?? 0) - (b.sort_order ?? 0);

          return orderComparison || a.name.localeCompare(b.name);
        }),
    [taskGroups],
  );
  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff]);
  const timeFields = useMemo(() => fields.filter((field) => field.type === "time"), [fields]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function parseExpectedValue() {
    if (form.operator === "is_true") {
      return true;
    }

    if (form.operator === "is_false") {
      return false;
    }

    if (form.operator === "answered") {
      return null;
    }

    if (form.operator === "greater_than") {
      return Number(form.expected_value);
    }

    return form.expected_value;
  }

  function startEdit(rule: QuestionnaireRule) {
    setEditingId(rule.id);
    setForm({
      field_key: rule.field_key,
      operator: rule.operator,
      expected_value:
        rule.expected_value === null || typeof rule.expected_value === "boolean"
          ? ""
          : String(rule.expected_value),
      is_active: rule.is_active,
      tasks: [...(rule.questionnaire_task_rule_tasks.length ? rule.questionnaire_task_rule_tasks : [{ ...emptyTask }])]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((task, index) => ({
          master_task_id: task.master_task_id,
          override_description: task.override_description ?? "",
          override_scheduled_time: task.override_scheduled_time?.slice(0, 5) ?? "",
          schedule_source_field_key: task.schedule_source_field_key ?? "",
          override_role_responsible: task.override_role_responsible ?? "",
          override_staff_id: task.override_staff_id ?? "",
          override_staff_ids: getRelationStaffIds(
            task.questionnaire_task_rule_task_staff,
            task.override_staff_id,
          ),
          override_visibility: task.override_visibility ?? "",
          sort_order: task.sort_order ?? index,
          master_tasks: task.master_tasks,
        })),
    });
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function updateTask(index: number, patch: Partial<RuleTask>) {
    setForm((current) => ({
      ...current,
      tasks: current.tasks.map((task, taskIndex) =>
        taskIndex === index ? { ...task, ...patch } : task,
      ),
    }));
  }

  function removeTask(index: number) {
    if (taskModalIndex !== null) {
      closeTaskModal();
    }

    setForm((current) => ({
      ...current,
      tasks: current.tasks.length === 1 ? current.tasks : current.tasks.filter((_, taskIndex) => taskIndex !== index),
    }));
  }

  function openTaskModal(index: number) {
    setTaskModalIndex(index);
    setTaskCreationForm(emptyTaskCreationForm);
    setTaskCreationError(null);
  }

  function closeTaskModal() {
    if (taskCreationSaving) {
      return;
    }

    setTaskModalIndex(null);
    setTaskCreationForm(emptyTaskCreationForm);
    setTaskCreationError(null);
  }

  async function createTaskFromModal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTaskCreationSaving(true);
    setTaskCreationError(null);

    try {
      if (taskModalIndex === null || !form.tasks[taskModalIndex]) {
        throw new Error("La fila de regla ya no esta disponible. Vuelve a abrir el modal.");
      }

      const payload = {
        name: taskCreationForm.name,
        base_description: taskCreationForm.base_description,
        visibility: taskCreationForm.visibility,
        default_staff_ids: taskCreationForm.default_staff_ids,
        required_responsible_count: taskCreationForm.required_responsible_count,
        assignment_group_id: taskCreationForm.assignment_group_id,
      };
      const result = (await adminFetch("/api/admin/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      })) as { task: MasterTask };

      setMasterTasks((current) =>
        sortMasterTasks([
          ...current.filter((task) => task.id !== result.task.id),
          result.task,
        ]),
      );
      updateTask(taskModalIndex, { master_task_id: result.task.id });
      setToastMessage(`Tarea "${result.task.name}" creada y seleccionada.`);
      setTaskModalIndex(null);
      setTaskCreationForm(emptyTaskCreationForm);
    } catch (createError) {
      setTaskCreationError(createError instanceof Error ? createError.message : "No se pudo crear la tarea.");
    } finally {
      setTaskCreationSaving(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (hasDuplicateTasks) {
        throw new Error("No puedes asociar la misma tarea maestra mas de una vez en la misma regla.");
      }

      const payload = {
        ...form,
        expected_value: parseExpectedValue(),
        tasks: form.tasks
          .filter((task) => task.master_task_id)
          .map((task, index) => ({ ...task, sort_order: index })),
      };

      if (editingId) {
        await adminFetch(`/api/admin/questionnaire-rules/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/api/admin/questionnaire-rules", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setToastMessage(editingId ? "Regla actualizada." : "Regla creada.");
      resetForm();
      await loadRules();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la regla.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRule() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await adminFetch(`/api/admin/questionnaire-rules/${deleteTarget.id}`, { method: "DELETE" });
      setToastMessage("Regla eliminada.");
      setDeleteTarget(null);
      await loadRules();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la regla.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">
            Configuracion
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Reglas del cuestionario</h1>
          <p className="mt-2 max-w-3xl text-gray-400">
            Relaciona cada pregunta con una o varias tareas maestras. Las preguntas sin regla se guardan como informacion.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
          <SlidersHorizontal className="h-5 w-5 text-purple-300" />
          <div>
            <p className="text-xs text-gray-500">Reglas activas</p>
            <p className="font-semibold">{rules.filter((rule) => rule.is_active).length}</p>
          </div>
        </div>
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <Field label="Pregunta">
            <select
              value={form.field_key}
              onChange={(event) => setForm((current) => ({ ...current, field_key: event.target.value }))}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
              required
            >
              <option value="">Selecciona una pregunta</option>
              {fields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.sectionTitle} - {field.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Operador">
            <select
              value={form.operator}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  operator: event.target.value as QuestionnaireRuleOperator,
                  expected_value: "",
                }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
            >
              {operatorOptions.map((operator) => (
                <option key={operator} value={operator}>
                  {operatorLabels[operator]}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-white/10 bg-zinc-950 px-3">
            <span className="text-sm font-medium text-gray-300">Activa</span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              className="h-5 w-5 accent-purple-300"
            />
          </label>
        </div>

        {!["answered", "is_true", "is_false"].includes(form.operator) ? (
          <Field label="Valor esperado">
            {selectedField?.options.length ? (
              <select
                value={form.expected_value}
                onChange={(event) => setForm((current) => ({ ...current, expected_value: event.target.value }))}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
              >
                <option value="">Selecciona valor</option>
                {selectedField.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                value={form.expected_value}
                onChange={(event) => setForm((current) => ({ ...current, expected_value: event.target.value }))}
                className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
                placeholder={form.operator === "greater_than" ? "80" : "Valor a comparar"}
                required
              />
            )}
          </Field>
        ) : null}

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Tareas a generar</h2>
              <p className="mt-1 text-sm text-gray-500">
                Una misma respuesta puede disparar varias tareas operativas, cada una con sus propios ajustes.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  tasks: [...current.tasks, { ...emptyTask, sort_order: current.tasks.length }],
                }))
              }
              className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-gray-200 transition hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Agregar tarea
            </button>
          </div>

          {form.tasks.map((task, index) => (
            <div key={index} className="grid gap-3 rounded-md border border-white/10 bg-zinc-950/60 p-4 lg:grid-cols-[1fr_120px_190px_190px_150px_44px]">
              <Field label="Tarea maestra">
                <select
                  value={task.master_task_id}
                  onChange={(event) => updateTask(index, { master_task_id: event.target.value })}
                  className={`h-11 w-full rounded-md border bg-zinc-950 px-3 text-white outline-none focus:border-purple-300 ${
                    duplicateTaskIds.includes(task.master_task_id) ? "border-red-400/60" : "border-white/10"
                  }`}
                  required
                >
                  <option value="">Selecciona tarea</option>
                  {masterTasks.map((masterTask) => (
                    <option
                      key={masterTask.id}
                      value={masterTask.id}
                      disabled={selectedTaskIds.includes(masterTask.id) && task.master_task_id !== masterTask.id}
                    >
                      {masterTask.name}
                    </option>
                  ))}
                </select>
                {duplicateTaskIds.includes(task.master_task_id) ? (
                  <p className="mt-2 text-xs text-red-200">Esta tarea ya esta seleccionada en la regla.</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => openTaskModal(index)}
                  className="mt-2 inline-flex h-8 items-center gap-2 rounded-md border border-purple-300/30 px-2.5 text-xs font-medium text-purple-100 transition hover:bg-purple-400/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Crear tarea
                </button>
              </Field>
              <Field label="Hora">
                <input
                  type="time"
                  value={task.override_scheduled_time}
                  onChange={(event) => updateTask(index, { override_scheduled_time: event.target.value })}
                  className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
                />
              </Field>
              <Field label="Hora desde">
                <select
                  value={task.schedule_source_field_key}
                  onChange={(event) => updateTask(index, { schedule_source_field_key: event.target.value })}
                  className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
                >
                  <option value="">Campo disparador</option>
                  {timeFields.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.sectionTitle} - {field.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Se usa si la hora fija esta vacia.
                </p>
              </Field>
              <Field label="Personal seleccionable">
                <select
                  multiple
                  size={Math.min(Math.max(sortedStaff.length, 3), 5)}
                  value={task.override_staff_ids}
                  onChange={(event) =>
                    updateTask(index, { override_staff_ids: getSelectValues(event.target) })
                  }
                  className="min-h-24 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-purple-300"
                >
                  {sortedStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                      {member.is_active ? "" : " (inactivo)"}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Si queda vacio, hereda la lista de la tarea maestra; si tampoco existe, participa todo el staff activo.
                </p>
              </Field>
              <Field label="Visibilidad">
                <select
                  value={task.override_visibility}
                  onChange={(event) =>
                    updateTask(index, { override_visibility: event.target.value as RuleTask["override_visibility"] })
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
                >
                  <option value="">Default</option>
                  <option value="interna">Interna</option>
                  <option value="publica">Publica</option>
                </select>
              </Field>
              <button
                type="button"
                onClick={() => removeTask(index)}
                className="mt-7 grid h-11 w-11 place-items-center rounded-md border border-red-400/20 text-red-300 transition hover:bg-red-500/10"
                title="Quitar tarea"
              >
                <X className="h-4 w-4" />
              </button>
              <label className="lg:col-span-6">
                <span className="mb-2 block text-sm font-medium text-gray-300">Descripcion override</span>
                <textarea
                  value={task.override_description}
                  onChange={(event) => updateTask(index, { override_description: event.target.value })}
                  className="min-h-20 w-full resize-y rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none focus:border-purple-300"
                  placeholder="Dejar vacio para usar la descripcion de la tarea maestra."
                />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-md border border-purple-300/20 bg-purple-400/10 p-4 text-sm text-purple-100">
          <p>
            <span className="font-semibold">Vista previa:</span>{" "}
            {selectedField ? selectedField.label : "Selecciona una pregunta"} {operatorLabels[form.operator].toLowerCase()}
            {form.expected_value ? ` "${form.expected_value}"` : ""} genera {selectedTaskNames.length} tarea(s).
          </p>
          {selectedTaskNames.length ? (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-purple-50">
              {selectedTaskNames.map((taskName, index) => (
                <li key={`${taskName}-${index}`}>{taskName}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-purple-200/80">Selecciona al menos una tarea maestra.</p>
          )}
          {hasDuplicateTasks ? (
            <p className="mt-3 text-red-100">Hay tareas repetidas. Quita el duplicado antes de guardar.</p>
          ) : null}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={saving || hasDuplicateTasks}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-purple-300 px-4 font-semibold text-zinc-950 transition hover:bg-purple-200 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Guardar regla" : "Crear regla"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
              title="Cancelar edicion"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-semibold">Reglas configuradas</h2>
          <div className="grid gap-3 lg:min-w-[680px] lg:grid-cols-[1fr_260px_auto]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Buscar reglas</span>
              <div className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 focus-within:border-purple-300">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                  placeholder="Pregunta, condicion, tarea..."
                />
                {hasSearch ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="grid h-7 w-7 place-items-center rounded-md text-gray-400 transition hover:bg-white/10 hover:text-white"
                    title="Limpiar busqueda"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </label>
            <Field label="Filtrar seccion">
              <select
                value={filterSection}
                onChange={(event) => setFilterSection(event.target.value)}
                className="h-10 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-purple-300"
              >
                <option value="">Todas las secciones</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.title}</option>
                ))}
              </select>
            </Field>
            <div className="flex items-end gap-3">
              <p className="pb-3 text-sm text-gray-400">
                {filteredRules.length} de {rules.length}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterSection("");
                }}
                disabled={!hasSearch && !filterSection}
                className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                title="Limpiar filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {rules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aun no hay reglas configuradas.</div>
        ) : filteredRules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay reglas que coincidan con la busqueda o seccion seleccionada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Pregunta</th>
                  <th className="px-5 py-4">Condicion</th>
                  <th className="px-5 py-4">Tareas</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{rule.field_label}</p>
                      <p className="mt-1 text-xs text-gray-500">{rule.section_title} · {rule.field_key}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {operatorLabels[rule.operator]}
                      {rule.expected_value !== null ? `: ${String(rule.expected_value)}` : ""}
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-gray-300">
                        {[...rule.questionnaire_task_rule_tasks]
                          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                          .map((task) => (
                          <p key={task.id}>
                            {task.master_tasks?.name ?? "Tarea sin catalogo"}
                            {getRelationStaffIds(
                              task.questionnaire_task_rule_task_staff,
                              task.override_staff_id,
                            ).length
                              ? ` - ${getStaffNames(
                                  getRelationStaffIds(
                                    task.questionnaire_task_rule_task_staff,
                                    task.override_staff_id,
                                  ),
                                  staffById,
                                )}`
                              : ""}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${rule.is_active ? "bg-emerald-400/10 text-emerald-200" : "bg-zinc-500/10 text-zinc-300"}`}>
                        {rule.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {rule.is_active ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(rule)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(rule)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-red-400/20 text-red-300 transition hover:bg-red-500/10"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Eliminar regla"
        description={`Se eliminara la regla de "${deleteTarget?.field_label ?? "esta pregunta"}".`}
        confirmLabel="Eliminar"
        loading={deleting}
        onCancel={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={deleteRule}
      />
      <TaskCreationModal
        error={taskCreationError}
        form={taskCreationForm}
        loading={taskCreationSaving}
        onCancel={closeTaskModal}
        onChange={(patch) => setTaskCreationForm((current) => ({ ...current, ...patch }))}
        onSubmit={createTaskFromModal}
        open={taskModalIndex !== null}
        staff={sortedStaff}
        taskGroups={activeTaskGroups}
      />
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function TaskCreationModal({
  error,
  form,
  loading,
  onCancel,
  onChange,
  onSubmit,
  open,
  staff,
  taskGroups,
}: {
  error: string | null;
  form: TaskCreationForm;
  loading: boolean;
  onCancel: () => void;
  onChange: (patch: Partial<TaskCreationForm>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  open: boolean;
  staff: StaffMember[];
  taskGroups: TaskGroup[];
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-lg border border-white/10 bg-[#111116] p-5 text-white shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">
              Tarea maestra
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Crear tarea</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              La tarea se agregara al catalogo y quedara seleccionada en la regla actual.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <input
              value={form.name}
              onChange={(event) => onChange({ name: event.target.value })}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
              placeholder="Preparar mesa de pastel"
              required
            />
          </Field>
          <Field label="Visibilidad">
            <select
              value={form.visibility}
              onChange={(event) => onChange({ visibility: event.target.value as TaskCreationForm["visibility"] })}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
            >
              <option value="interna">Interna</option>
              <option value="publica">Publica</option>
            </select>
          </Field>
          <Field label="Personal seleccionable">
            <select
              multiple
              size={Math.min(Math.max(staff.length, 3), 5)}
              value={form.default_staff_ids}
              onChange={(event) => onChange({ default_staff_ids: getSelectValues(event.target) })}
              className="min-h-24 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-purple-300"
            >
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                  {member.is_active ? "" : " (inactivo)"}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              Si queda vacio, la autoasignacion podra usar todo el staff activo.
            </p>
          </Field>
          <Field label="Cantidad de responsables">
            <input
              type="number"
              min={1}
              value={form.required_responsible_count}
              onChange={(event) => onChange({ required_responsible_count: event.target.value })}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
            />
          </Field>
          <Field label="Grupo de asignacion">
            <select
              value={form.assignment_group_id}
              onChange={(event) => onChange({ assignment_group_id: event.target.value })}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
            >
              <option value="">Sin grupo</option>
              {taskGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </Field>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-300">Descripcion base</span>
            <textarea
              value={form.base_description}
              onChange={(event) => onChange({ base_description: event.target.value })}
              className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none focus:border-purple-300"
              placeholder="Describe que debe hacer el equipo cuando esta tarea se genere."
            />
          </label>
        </div>

        {error ? (
          <div className="mt-5 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-md border border-white/10 px-4 font-medium text-gray-200 transition hover:bg-white/10 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-purple-300 px-4 font-semibold text-zinc-950 transition hover:bg-purple-200 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear y seleccionar
          </button>
        </div>
      </form>
    </div>
  );
}
