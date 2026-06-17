"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, Pencil, Plus, RotateCcw, Save, Search, Trash2, X } from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { matchesSearch, normalizeSearchText } from "@/lib/search";

type TaskGroup = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  is_active: boolean;
  sort_order: number | null;
  task_count: number;
};

type GroupForm = {
  name: string;
  description: string;
  is_active: boolean;
};

const emptyForm: GroupForm = {
  name: "",
  description: "",
  is_active: true,
};

export default function TaskGroupsPage() {
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [form, setForm] = useState<GroupForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TaskGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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

  const loadGroups = useCallback(async () => {
    setError(null);
    const payload = await adminFetch("/api/admin/task-groups");
    setGroups(payload.groups ?? []);
  }, [adminFetch]);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      try {
        await loadGroups();
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar los grupos.");
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
  }, [loadGroups]);

  const activeCount = groups.filter((group) => group.is_active).length;
  const inactiveCount = groups.length - activeCount;
  const hasSearch = normalizeSearchText(searchQuery).length > 0;
  const visibleGroups = useMemo(
    () =>
      groups.filter((group) =>
        matchesSearch(searchQuery, [
          group.name,
          group.key,
          group.description,
          group.is_active ? "Activo" : "Inactivo",
          String(group.task_count ?? 0),
        ]),
      ),
    [groups, searchQuery],
  );

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(group: TaskGroup) {
    setEditingId(group.id);
    setForm({
      name: group.name,
      description: group.description ?? "",
      is_active: group.is_active,
    });
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await adminFetch(`/api/admin/task-groups/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify({ ...form, sort_order: 0 }),
        });
      } else {
        await adminFetch("/api/admin/task-groups", {
          method: "POST",
          body: JSON.stringify({ ...form, sort_order: 0 }),
        });
      }

      setToastMessage(editingId ? "Grupo actualizado." : "Grupo creado.");
      resetForm();
      await loadGroups();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el grupo.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await adminFetch(`/api/admin/task-groups/${deleteTarget.id}`, { method: "DELETE" });
      setToastMessage(`Grupo "${deleteTarget.name}" eliminado.`);
      setDeleteTarget(null);
      await loadGroups();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el grupo.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-green-300">Catalogos</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Grupos de tareas</h1>
          <p className="mt-2 max-w-3xl text-gray-400">
            Administra bloques reutilizables para asignar varias tareas a una misma persona.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Activos" value={activeCount} />
          <Metric label="Inactivos" value={inactiveCount} />
        </div>
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_160px_auto]">
          <Field label="Nombre">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-green-300"
              placeholder="Arenero"
              required
            />
          </Field>
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-white/10 bg-zinc-950 px-3 lg:mt-7">
            <span className="text-sm font-medium text-gray-300">Activo</span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
              className="h-5 w-5 accent-green-300"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 min-w-40 items-center justify-center gap-2 rounded-md bg-green-300 px-4 font-semibold text-zinc-950 transition hover:bg-green-200 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Guardar" : "Agregar"}
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
          <label className="block lg:col-span-3">
            <span className="mb-2 block text-sm font-medium text-gray-300">Descripcion</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-20 w-full resize-y rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none focus:border-green-300"
              placeholder="Uso operativo del grupo."
            />
          </label>
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
            <span className="mb-2 block text-sm font-medium text-gray-300">Buscar grupos</span>
            <div className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 focus-within:border-green-300">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                placeholder="Nombre, estado..."
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
              {visibleGroups.length} de {groups.length} grupos
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

        {groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aun no hay grupos de tareas.</div>
        ) : visibleGroups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay grupos que coincidan con la busqueda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Grupo</th>
                  <th className="px-5 py-4">Tareas</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleGroups.map((group) => (
                  <tr key={group.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{group.name}</p>
                      <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-gray-500">
                        {group.description || "Sin descripcion."}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{group.task_count ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${group.is_active ? "bg-emerald-400/10 text-emerald-200" : "bg-zinc-500/10 text-zinc-300"}`}>
                        <CheckCircle2 className="h-3 w-3" />
                        {group.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(group)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(group)}
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
        title="Eliminar grupo"
        description={
          deleteTarget && deleteTarget.task_count > 0
            ? `No se puede eliminar "${deleteTarget.name}" porque tiene ${deleteTarget.task_count} tarea(s) asociada(s). Primero cambia esas tareas a otro grupo o dejalas sin grupo.`
            : `Se eliminara "${deleteTarget?.name ?? "este grupo"}" porque no tiene tareas asociadas.`
        }
        confirmLabel="Eliminar"
        loading={deleting}
        onCancel={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={deleteGroup}
      />
      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-green-300">
        <CheckCircle2 className="h-5 w-5" />
      </span>
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
