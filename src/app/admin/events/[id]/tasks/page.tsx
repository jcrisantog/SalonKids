"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { matchesSearch, normalizeSearchText } from "@/lib/search";

type EventTaskStatus = "pendiente" | "en_progreso" | "completada";
type EventTaskVisibility = "interna" | "publica";
type VisibilityFilter = "todas" | EventTaskVisibility;
type ResponsibleFilter = "todos" | "sin_responsable" | string;

type EventSummary = {
  id: string;
  celebratory_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  token_unico: string;
  status: string;
};

type EventTask = {
  id: string;
  event_id: string;
  task_name: string;
  description: string | null;
  scheduled_time: string | null;
  staff_id: string | null;
  role_responsible: string | null;
  status: EventTaskStatus;
  visibility: EventTaskVisibility;
  is_manual_override: boolean;
  created_at: string;
};

type StaffMember = {
  id: string;
  name: string;
  primary_role: string;
  is_active: boolean;
};

type TaskForm = {
  task_name: string;
  description: string;
  scheduled_time: string;
  staff_id: string;
  role_responsible: string;
  status: EventTaskStatus;
  visibility: EventTaskVisibility;
  is_manual_override: boolean;
};

type EventTasksPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const emptyForm: TaskForm = {
  task_name: "",
  description: "",
  scheduled_time: "",
  staff_id: "",
  role_responsible: "",
  status: "pendiente",
  visibility: "interna",
  is_manual_override: true,
};

const statusLabels: Record<EventTaskStatus, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function EventTasksPage({ params }: EventTasksPageProps) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventTask | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responsibleFilter, setResponsibleFilter] = useState<ResponsibleFilter>("todos");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff]);
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
  const responsibleOptions = useMemo(() => {
    const assignedStaffIds = new Set(tasks.map((task) => task.staff_id).filter(Boolean) as string[]);
    const assignedStaff = sortedStaff.filter((member) => assignedStaffIds.has(member.id));
    const hasUnassigned = tasks.some((task) => !task.staff_id);

    return { assignedStaff, hasUnassigned };
  }, [sortedStaff, tasks]);
  const hasSearch = normalizeSearchText(searchQuery).length > 0;
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesResponsible =
          responsibleFilter === "todos" ||
          (responsibleFilter === "sin_responsable" ? !task.staff_id : task.staff_id === responsibleFilter);
        const matchesVisibility =
          visibilityFilter === "todas" || task.visibility === visibilityFilter;
        const matchesQuery = matchesSearch(searchQuery, [
          task.task_name,
          task.description,
          task.scheduled_time?.slice(0, 5),
          statusLabels[task.status],
          task.status,
          task.visibility === "publica" ? "Publica" : "Interna",
          task.role_responsible,
          task.staff_id
            ? staffById.get(task.staff_id)?.name ?? "Responsable no encontrado"
            : task.role_responsible || "Sin asignar",
        ]);

        return matchesResponsible && matchesVisibility && matchesQuery;
      }),
    [responsibleFilter, searchQuery, staffById, tasks, visibilityFilter],
  );
  const activeFilterCount =
    (responsibleFilter === "todos" ? 0 : 1) + (visibilityFilter === "todas" ? 0 : 1) + (hasSearch ? 1 : 0);

  useEffect(() => {
    let ignore = false;

    async function resolveParams() {
      const resolved = await params;

      if (!ignore) {
        setEventId(resolved.id);
      }
    }

    resolveParams();

    return () => {
      ignore = true;
    };
  }, [params]);

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

  const fetchEventTasks = useCallback(async () => {
    if (!eventId) {
      return null;
    }

    return adminFetch(`/api/admin/events/${eventId}/tasks`);
  }, [adminFetch, eventId]);

  const loadTasks = useCallback(async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = await fetchEventTasks();

      if (!payload) {
        return;
      }

      setEvent(payload.event);
      setTasks(payload.tasks ?? []);
      setStaff(payload.staff ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tareas.");
    } finally {
      setLoading(false);
    }
  }, [eventId, fetchEventTasks]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    let ignore = false;

    async function loadInitialTasks() {
      try {
        const payload = await fetchEventTasks();

        if (!ignore && payload) {
          setEvent(payload.event);
          setTasks(payload.tasks ?? []);
          setStaff(payload.staff ?? []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : "No se pudieron cargar tareas.",
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
  }, [eventId, fetchEventTasks]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(task: EventTask) {
    setEditingId(task.id);
    setForm({
      task_name: task.task_name,
      description: task.description ?? "",
      scheduled_time: task.scheduled_time?.slice(0, 5) ?? "",
      staff_id: task.staff_id ?? "",
      role_responsible: task.role_responsible ?? "",
      status: task.status,
      visibility: task.visibility,
      is_manual_override: true,
    });
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function getResponsibleLabel(task: EventTask) {
    if (task.staff_id) {
      return staffById.get(task.staff_id)?.name ?? "Responsable no encontrado";
    }

    return task.role_responsible || "Sin asignar";
  }

  function getResponsibleFilterLabel() {
    if (responsibleFilter === "todos") {
      return "Todos los responsables";
    }

    if (responsibleFilter === "sin_responsable") {
      return "Sin responsable";
    }

    return staffById.get(responsibleFilter)?.name ?? "Responsable no encontrado";
  }

  function resetFilters() {
    setResponsibleFilter("todos");
    setVisibilityFilter("todas");
    setSearchQuery("");
  }

  function buildPrintRows() {
    return filteredTasks
      .map((task, index) => {
        const rowClass = index % 2 === 0 ? "row-even" : "row-odd";
          return `
            <tr class="${rowClass}">
              <td class="time">${escapeHtml(task.scheduled_time?.slice(0, 5) || "Sin hora")}</td>
              <td>${escapeHtml(task.task_name)}</td>
              <td class="description">${escapeHtml(task.description || "Sin descripcion")}</td>
              <td>${escapeHtml(getResponsibleLabel(task))}</td>
            </tr>
          `;
      })
      .join("");
  }

  function printFilteredTasks() {
    if (!event || filteredTasks.length === 0) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=980,height=760");

    if (!printWindow) {
      setError("No se pudo abrir la ventana de impresion. Revisa el bloqueador de ventanas.");
      return;
    }

    const generatedAt = new Date().toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const eventTime = `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)}`;

    printWindow.document.write(`<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Tareas filtradas - ${escapeHtml(event.celebratory_name)}</title>
          <style>
            @page { size: letter; margin: 16mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f8fafc;
              color: #172033;
              font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            .page {
              min-height: 100vh;
              background:
                radial-gradient(circle at top right, rgba(34, 211, 238, 0.22), transparent 28%),
                linear-gradient(145deg, #ffffff 0%, #f8fbff 58%, #eef8f4 100%);
              border: 1px solid #dbeafe;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
            }
            header {
              background: linear-gradient(135deg, #2563eb 0%, #14b8a6 72%, #facc15 130%);
              color: white;
              padding: 30px 34px;
              position: relative;
            }
            header::after {
              content: "";
              position: absolute;
              right: 28px;
              top: 26px;
              width: 92px;
              height: 92px;
              border-radius: 999px;
              border: 18px solid rgba(255, 255, 255, 0.18);
            }
            .eyebrow {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              opacity: 0.86;
            }
            h1 {
              margin: 8px 0 8px;
              max-width: 620px;
              font-size: 34px;
              line-height: 1.05;
            }
            .subtitle {
              margin: 0;
              font-size: 14px;
              opacity: 0.92;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              padding: 20px 24px;
              background: rgba(255, 255, 255, 0.78);
            }
            .metric {
              border: 1px solid #dbeafe;
              border-radius: 14px;
              background: white;
              padding: 12px 14px;
            }
            .metric span {
              display: block;
              color: #64748b;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            .metric strong {
              display: block;
              margin-top: 5px;
              color: #0f172a;
              font-size: 15px;
            }
            main { padding: 0 24px 26px; }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0 9px;
              font-size: 13px;
            }
            thead th {
              padding: 10px 14px;
              color: #0f766e;
              font-size: 11px;
              letter-spacing: 0.1em;
              text-align: left;
              text-transform: uppercase;
            }
            tbody tr {
              break-inside: avoid;
              box-shadow: 0 5px 18px rgba(15, 23, 42, 0.06);
            }
            tbody td {
              padding: 14px;
              background: white;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }
            tbody td:first-child {
              border-left: 6px solid #38bdf8;
              border-radius: 12px 0 0 12px;
              font-weight: 800;
              color: #1d4ed8;
              width: 95px;
            }
            .description {
              color: #475569;
              font-size: 12px;
              line-height: 1.45;
              width: 34%;
            }
            tbody td:last-child {
              border-right: 1px solid #e2e8f0;
              border-radius: 0 12px 12px 0;
              color: #0f766e;
              font-weight: 700;
              width: 180px;
            }
            .row-odd td { background: #f8fcff; }
            footer {
              padding: 0 24px 24px;
              color: #64748b;
              font-size: 11px;
              text-align: right;
            }
            @media print {
              body { background: white; }
              .page {
                min-height: auto;
                border: 0;
                border-radius: 0;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <section class="page">
            <header>
              <div class="eyebrow">Reporte operativo filtrado</div>
              <h1>${escapeHtml(event.celebratory_name)}</h1>
              <p class="subtitle">${escapeHtml(event.event_date)} · ${escapeHtml(eventTime)}</p>
            </header>
            <section class="summary">
              <div class="metric"><span>Tareas</span><strong>${filteredTasks.length}</strong></div>
              <div class="metric"><span>Responsable</span><strong>${escapeHtml(getResponsibleFilterLabel())}</strong></div>
              <div class="metric"><span>Generado</span><strong>${escapeHtml(generatedAt)}</strong></div>
            </section>
            <main>
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Tarea</th>
                    <th>Descripcion</th>
                    <th>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  ${buildPrintRows()}
                </tbody>
              </table>
            </main>
            <footer>Salon Kids · Informacion generada desde la tabla filtrada</footer>
          </section>
          <script>
            window.addEventListener("load", () => {
              window.print();
            });
          </script>
        </body>
      </html>`);
    printWindow.document.close();
  }

  async function handleSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();

    if (!eventId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        await adminFetch(`/api/admin/events/${eventId}/tasks/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await adminFetch(`/api/admin/events/${eventId}/tasks`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      setToastMessage(
        editingId
          ? "Tarea actualizada y protegida como ajuste manual."
          : "Tarea manual agregada al evento.",
      );
      resetForm();
      await loadTasks();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar la tarea.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask() {
    if (!eventId || !deleteTarget) {
      return;
    }

    setError(null);
    setDeletingId(deleteTarget.id);
    const deletedName = deleteTarget.task_name;

    try {
      await adminFetch(`/api/admin/events/${eventId}/tasks/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      setToastMessage(`La tarea "${deletedName}" fue eliminada.`);
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
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Tareas de {event?.celebratory_name ?? "evento"}
          </h1>
          <p className="mt-2 text-gray-400">
            Edita tareas operativas. Cualquier ajuste manual queda protegido del motor de reglas.
          </p>
        </div>
        {event ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-gray-300">
            {event.event_date} · {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
          </div>
        ) : null}
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_160px_220px_180px_160px]">
          <Field label="Tarea">
            <input
              value={form.task_name}
              onChange={(event) => setForm((current) => ({ ...current, task_name: event.target.value }))}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              placeholder="Confirmar pastel con anfitrion"
              required
            />
          </Field>
          <Field label="Hora">
            <input
              type="time"
              value={form.scheduled_time}
              onChange={(event) =>
                setForm((current) => ({ ...current, scheduled_time: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
            />
          </Field>
          <Field label="Rol responsable">
            <input
              value={form.role_responsible}
              onChange={(event) =>
                setForm((current) => ({ ...current, role_responsible: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              placeholder="DJ"
            />
          </Field>
          <Field label="Responsable">
            <select
              value={form.staff_id}
              onChange={(event) =>
                setForm((current) => ({ ...current, staff_id: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
            >
              <option value="">Sin responsable</option>
              {sortedStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.primary_role}
                  {member.is_active ? "" : " (inactivo)"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Estado">
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as EventTaskStatus }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_180px_220px]">
          <Field label="Descripcion">
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-24 w-full resize-y rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-white outline-none focus:border-blue-300"
              placeholder="Instrucciones operativas para el staff."
            />
          </Field>
          <Field label="Visibilidad">
            <select
              value={form.visibility}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  visibility: event.target.value as EventTaskVisibility,
                }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
            >
              <option value="interna">Interna</option>
              <option value="publica">Publica</option>
            </select>
          </Field>
          <label className="mt-7 flex h-11 items-center gap-3 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={form.is_manual_override}
              onChange={(event) =>
                setForm((current) => ({ ...current, is_manual_override: event.target.checked }))
              }
              className="h-4 w-4 accent-blue-300"
            />
            Proteger ajuste manual
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-blue-300 px-4 font-semibold text-zinc-950 transition hover:bg-blue-200 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              <Save className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingId ? "Guardar tarea" : "Agregar tarea"}
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
        <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.04] p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[760px] lg:grid-cols-[1fr_240px_190px]">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Buscar tareas</span>
              <div className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 focus-within:border-blue-300">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                  placeholder="Tarea, descripcion, hora, staff..."
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
            <Field label="Filtrar responsable">
              <select
                value={responsibleFilter}
                onChange={(event) => setResponsibleFilter(event.target.value as ResponsibleFilter)}
                className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              >
                <option value="todos">Todos los responsables</option>
                {responsibleOptions.assignedStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.primary_role}
                    {member.is_active ? "" : " (inactivo)"}
                  </option>
                ))}
                {responsibleOptions.hasUnassigned ? (
                  <option value="sin_responsable">Sin responsable</option>
                ) : null}
              </select>
            </Field>
            <Field label="Filtrar visibilidad">
              <select
                value={visibilityFilter}
                onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
                className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              >
                <option value="todas">Todas</option>
                <option value="interna">Interna</option>
                <option value="publica">Publica</option>
              </select>
            </Field>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-gray-400">
              {filteredTasks.length} de {tasks.length} tareas
              {activeFilterCount ? ` · ${activeFilterCount} filtro(s)` : ""}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
                className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                title="Limpiar filtros"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={printFilteredTasks}
                disabled={!event || filteredTasks.length === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileText className="h-4 w-4" />
                Generar PDF
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="grid min-h-52 place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-300" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Este evento aun no tiene tareas.</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay tareas que coincidan con la busqueda o filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Tarea</th>
                  <th className="px-5 py-4">Hora</th>
                  <th className="px-5 py-4">Responsable</th>
                  <th className="px-5 py-4">Rol</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Proteccion</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{task.task_name}</p>
                      <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-gray-500">
                        {task.description || "Sin descripcion."}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {task.scheduled_time?.slice(0, 5) || "Sin hora"}
                    </td>
                    <td className="px-5 py-4 text-gray-300">
                      {getResponsibleLabel(task)}
                    </td>
                    <td className="px-5 py-4 text-gray-300">{task.role_responsible || "Sin rol"}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-blue-400/10 px-2 py-1 text-xs font-semibold text-blue-200">
                        {statusLabels[task.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold ${
                          task.is_manual_override
                            ? "bg-emerald-400/10 text-emerald-200"
                            : "bg-zinc-500/10 text-zinc-400"
                        }`}
                      >
                        {task.is_manual_override ? <Check className="h-3 w-3" /> : null}
                        {task.is_manual_override ? "Manual" : "Motor"}
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
        title="Eliminar tarea"
        description={`Se eliminara "${deleteTarget?.task_name ?? "esta tarea"}" del evento. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={Boolean(deletingId)}
        onCancel={() => (deletingId ? null : setDeleteTarget(null))}
        onConfirm={deleteTask}
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
