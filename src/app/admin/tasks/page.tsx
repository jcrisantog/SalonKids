"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, RotateCcw, Save, Search, Trash2, X } from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { matchesSearch, normalizeSearchText } from "@/lib/search";

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
  master_task_default_staff?: Array<{
    staff_id: string;
    sort_order: number | null;
    staff?: StaffMember | null;
  }>;
  created_at: string;
};

type StaffMember = {
  id: string;
  name: string;
  primary_role: string;
  is_active: boolean;
};

type TaskForm = {
  name: string;
  base_description: string;
  visibility: "interna" | "publica";
  area: string;
  default_role: string;
  default_staff_ids: string[];
  required_responsible_count: string;
};

const emptyForm: TaskForm = {
  name: "",
  base_description: "",
  visibility: "interna",
  area: "",
  default_role: "",
  default_staff_ids: [],
  required_responsible_count: "1",
};

function getSelectValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function getTaskResponsibleIds(task: MasterTask) {
  const relationIds = [...(task.master_task_default_staff ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((relation) => relation.staff_id)
    .filter(Boolean);

  if (relationIds.length > 0) {
    return relationIds;
  }

  return task.default_staff_id ? [task.default_staff_id] : [];
}

function getTaskResponsibleLabel(task: MasterTask, staffById: Map<string, StaffMember>) {
  const names = getTaskResponsibleIds(task).map(
    (staffId) => staffById.get(staffId)?.name ?? "Responsable no encontrado",
  );

  return names.length ? names.join(", ") : "Sin responsable";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<MasterTask[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MasterTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const internalCount = useMemo(
    () => tasks.filter((task) => task.visibility === "interna").length,
    [tasks],
  );
  const publicCount = tasks.length - internalCount;
  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff]);
  const hasSearch = normalizeSearchText(searchQuery).length > 0;
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
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) =>
        matchesSearch(searchQuery, [
          task.name,
          task.base_description,
          task.visibility === "publica" ? "Publica" : "Interna",
          getTaskResponsibleLabel(task, staffById),
          String(task.required_responsible_count ?? 1),
        ]),
      ),
    [searchQuery, staffById, tasks],
  );

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

  const fetchTasks = useCallback(async () => {
    const payload = await adminFetch("/api/admin/tasks");

    return payload;
  }, [adminFetch]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = await fetchTasks();
      setTasks(payload.tasks ?? []);
      setStaff(payload.staff ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar las tareas.");
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialTasks() {
      try {
        const nextTasks = await fetchTasks();

        if (!ignore) {
          setTasks(nextTasks.tasks ?? []);
          setStaff(nextTasks.staff ?? []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : "No se pudieron cargar las tareas.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialTasks();

    return () => {
      ignore = true;
    };
  }, [fetchTasks]);

  function startEdit(task: MasterTask) {
    setEditingId(task.id);
    setForm({
      name: task.name,
      base_description: task.base_description ?? "",
      visibility: task.visibility,
      area: task.area ?? "",
      default_role: task.default_role ?? "",
      default_staff_ids: getTaskResponsibleIds(task),
      required_responsible_count: String(task.required_responsible_count ?? 1),
    });
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await adminFetch(`/api/admin/tasks/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch("/api/admin/tasks", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      resetForm();
      await loadTasks();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask() {
    if (!deleteTarget) {
      return;
    }

    setError(null);
    setDeletingId(deleteTarget.id);
    const deletedName = deleteTarget.name;

    try {
      await adminFetch(`/api/admin/tasks/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setToastMessage(`"${deletedName}" fue eliminada del catalogo de tareas maestras.`);
      await loadTasks();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-300">Catalogos</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Tareas Maestras</h1>
          <p className="mt-2 text-gray-400">
            Define plantillas operativas con responsable asignado y visibilidad.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric icon={<EyeOff className="h-5 w-5" />} label="Internas" value={internalCount} />
          <Metric icon={<Eye className="h-5 w-5" />} label="Publicas" value={publicCount} />
        </div>
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
          <div className="grid gap-4">
            <Field label="Nombre de tarea">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-green-300"
                placeholder="Montar mesa de pastel"
                required
              />
            </Field>
            <Field label="Descripcion estandar">
              <textarea
                value={form.base_description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, base_description: event.target.value }))
                }
                className="min-h-36 w-full resize-y rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none focus:border-green-300"
                placeholder="Instrucciones operativas que se copiaran al backlog del evento."
              />
            </Field>
          </div>

          <div className="grid gap-4 content-start">
            <Field label="Responsables default">
              <select
                multiple
                size={Math.min(Math.max(sortedStaff.length, 4), 7)}
                value={form.default_staff_ids}
                onChange={(event) =>
                  setForm((current) => ({ ...current, default_staff_ids: getSelectValues(event.target) }))
                }
                className="h-40 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-green-300"
              >
                {sortedStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.is_active ? "" : " (inactivo)"}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Cantidad">
                <input
                  type="number"
                  min={1}
                  value={form.required_responsible_count}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, required_responsible_count: event.target.value }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-green-300"
                />
              </Field>
              <Field label="Visibilidad">
                <select
                  value={form.visibility}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      visibility: event.target.value as TaskForm["visibility"],
                    }))
                  }
                  className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-green-300"
                >
                  <option value="interna">Interna</option>
                  <option value="publica">Publica</option>
                </select>
              </Field>
            </div>

            <div className="flex gap-2 sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-green-300 px-4 font-semibold text-zinc-950 transition hover:bg-green-200 disabled:opacity-60 sm:flex-none sm:min-w-44"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {editingId ? "Guardar cambios" : "Agregar tarea"}
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
          </div>
        </div>
      </form>

      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.04] p-4 lg:flex-row lg:items-end lg:justify-between">
          <label className="block lg:min-w-[360px]">
            <span className="mb-2 block text-sm font-medium text-gray-300">Buscar tareas maestras</span>
            <div className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 focus-within:border-green-300">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                placeholder="Nombre, responsable, visibilidad..."
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
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-400">
              {visibleTasks.length} de {tasks.length} tareas
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              disabled={!hasSearch}
              className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Limpiar busqueda"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="grid min-h-52 place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-green-300" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aun no hay tareas maestras.</div>
        ) : visibleTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay tareas maestras que coincidan con la busqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Tarea</th>
                  <th className="px-5 py-4">Responsables</th>
                  <th className="px-5 py-4">Cantidad</th>
                  <th className="px-5 py-4">Visibilidad</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleTasks.map((task) => (
                  <tr key={task.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{task.name}</p>
                      <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-gray-500">
                        {task.base_description || "Sin descripcion estandar."}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {getTaskResponsibleLabel(task, staffById)}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {task.required_responsible_count ?? 1}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${task.visibility === "publica" ? "bg-cyan-400/10 text-cyan-200" : "bg-purple-400/10 text-purple-200"}`}>
                        {task.visibility === "publica" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {task.visibility === "publica" ? "Publica" : "Interna"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(task)}
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
        title="Eliminar tarea maestra"
        description={`Se eliminara "${deleteTarget?.name ?? "esta tarea"}" del catalogo de plantillas. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={Boolean(deletingId)}
        onCancel={() => (deletingId ? null : setDeleteTarget(null))}
        onConfirm={deleteTask}
      />
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-green-300">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
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
