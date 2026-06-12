"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Pencil, Plus, Save, Trash2, UserRoundCheck, X } from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type StaffMember = {
  id: string;
  name: string;
  primary_role: string;
  is_active: boolean;
  created_at: string;
};

type StaffForm = {
  name: string;
  is_active: boolean;
};

const emptyForm: StaffForm = {
  name: "",
  is_active: true,
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCount = useMemo(() => staff.filter((member) => member.is_active).length, [staff]);

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

  const fetchStaff = useCallback(async () => {
    const payload = await adminFetch("/api/admin/staff");

    return payload.staff ?? [];
  }, [adminFetch]);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextStaff = await fetchStaff();
      setStaff(nextStaff);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el personal.");
    } finally {
      setLoading(false);
    }
  }, [fetchStaff]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialStaff() {
      try {
        const nextStaff = await fetchStaff();

        if (!ignore) {
          setStaff(nextStaff);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : "No se pudo cargar el personal.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialStaff();

    return () => {
      ignore = true;
    };
  }, [fetchStaff]);

  function startEdit(member: StaffMember) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      is_active: member.is_active,
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
        await adminFetch(`/api/admin/staff/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch("/api/admin/staff", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      resetForm();
      await loadStaff();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMember() {
    if (!deleteTarget) {
      return;
    }

    setError(null);
    setDeletingId(deleteTarget.id);
    const deletedName = deleteTarget.name;

    try {
      await adminFetch(`/api/admin/staff/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setToastMessage(`${deletedName} fue eliminado del catalogo de staff.`);
      await loadStaff();
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
          <p className="text-sm font-semibold uppercase tracking-wider text-purple-300">Catalogos</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Personal / Staff</h1>
          <p className="mt-2 text-gray-400">
            Administra nombres y disponibilidad para asignaciones.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
          <UserRoundCheck className="h-5 w-5 text-emerald-300" />
          <div>
            <p className="text-xs text-gray-500">Activos</p>
            <p className="font-semibold">{activeCount} disponibles</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[1fr_150px_auto] lg:items-end">
        <Field label="Nombre">
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-purple-300"
            placeholder="Luis Santiago"
            required
          />
        </Field>
        <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              setForm((current) => ({ ...current, is_active: event.target.checked }))
            }
            className="h-4 w-4 accent-purple-400"
          />
          Activo
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-purple-400 px-4 font-semibold text-zinc-950 transition hover:bg-purple-300 disabled:opacity-60"
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
      </form>

      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        {loading ? (
          <div className="grid min-h-52 place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-purple-300" />
          </div>
        ) : staff.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aun no hay personal registrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Nombre</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {staff.map((member) => (
                  <tr key={member.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-medium text-white">{member.name}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${member.is_active ? "bg-emerald-400/10 text-emerald-200" : "bg-zinc-500/10 text-zinc-400"}`}>
                        {member.is_active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {member.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(member)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(member)}
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
        title="Eliminar integrante"
        description={`Se eliminara ${deleteTarget?.name ?? "este integrante"} del catalogo de staff. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={Boolean(deletingId)}
        onCancel={() => (deletingId ? null : setDeleteTarget(null))}
        onConfirm={deleteMember}
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
