"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  FileText,
  History,
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
import { sanitizeGuidelinesHtml } from "@/lib/guidelines-notices";
import { matchesSearch, normalizeSearchText } from "@/lib/search";

type EventTaskStatus = "pendiente" | "en_progreso" | "completada";
type EventTaskVisibility = "interna" | "publica";
type VisibilityFilter = "todas" | EventTaskVisibility;
type ResponsibleFilter = "todos" | "sin_responsable" | string;
type TaskGroupFilter = "todos" | "sin_grupo" | string;

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
  staff_ids?: string[];
  event_task_staff?: Array<{
    staff_id: string;
    sort_order: number | null;
    staff?: StaffMember | null;
  }>;
  role_responsible: string | null;
  status: EventTaskStatus;
  visibility: EventTaskVisibility;
  is_manual_override: boolean;
  source_master_task_id: string | null;
  task_group?: TaskGroup | null;
  created_at: string;
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
  is_active: boolean;
};

type TaskForm = {
  task_name: string;
  description: string;
  scheduled_time: string;
  staff_ids: string[];
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
  staff_ids: [],
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

function getSelectValues(select: HTMLSelectElement) {
  return Array.from(select.selectedOptions).map((option) => option.value);
}

function getTaskResponsibleIds(task: EventTask) {
  const relationIds = [...(task.event_task_staff ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((relation) => relation.staff_id)
    .filter(Boolean);

  if (relationIds.length > 0) {
    return relationIds;
  }

  return task.staff_id ? [task.staff_id] : [];
}

function getTaskResponsibleLabel(task: EventTask, staffById: Map<string, StaffMember>, emptyLabel = "Sin responsable") {
  const names = getTaskResponsibleIds(task).map(
    (staffId) => staffById.get(staffId)?.name ?? "Responsable no encontrado",
  );

  return names.length ? names.join(", ") : emptyLabel;
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
  const [assigning, setAssigning] = useState(false);
  const [loadingGuidelinesForPdf, setLoadingGuidelinesForPdf] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [guidelinesPdfModalOpen, setGuidelinesPdfModalOpen] = useState(false);
  const [pendingGuidelinesHtml, setPendingGuidelinesHtml] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<EventTask | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responsibleFilter, setResponsibleFilter] = useState<ResponsibleFilter>("todos");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("todas");
  const [taskGroupFilter, setTaskGroupFilter] = useState<TaskGroupFilter>("todos");
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
    const assignedStaffIds = new Set(tasks.flatMap(getTaskResponsibleIds));
    const assignedStaff = sortedStaff.filter((member) => assignedStaffIds.has(member.id));
    const hasUnassigned = tasks.some((task) => getTaskResponsibleIds(task).length === 0);

    return { assignedStaff, hasUnassigned };
  }, [sortedStaff, tasks]);
  const taskGroupOptions = useMemo(() => {
    const groups = new Map<string, TaskGroup>();
    let hasUngrouped = false;

    for (const task of tasks) {
      if (task.task_group?.id) {
        groups.set(task.task_group.id, task.task_group);
      } else {
        hasUngrouped = true;
      }
    }

    return {
      groups: Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name)),
      hasUngrouped,
    };
  }, [tasks]);
  const hasSearch = normalizeSearchText(searchQuery).length > 0;
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const matchesResponsible =
          responsibleFilter === "todos" ||
          (responsibleFilter === "sin_responsable"
            ? getTaskResponsibleIds(task).length === 0
            : getTaskResponsibleIds(task).includes(responsibleFilter));
        const matchesVisibility =
          visibilityFilter === "todas" || task.visibility === visibilityFilter;
        const matchesTaskGroup =
          taskGroupFilter === "todos" ||
          (taskGroupFilter === "sin_grupo" && !task.task_group?.id) ||
          task.task_group?.id === taskGroupFilter;
        const matchesQuery = matchesSearch(searchQuery, [
          task.task_name,
          task.description,
          task.scheduled_time?.slice(0, 5),
          statusLabels[task.status],
          task.status,
          task.visibility === "publica" ? "Publica" : "Interna",
          getTaskResponsibleLabel(task, staffById),
          task.task_group?.name,
          task.task_group?.key,
        ]);

        return matchesResponsible && matchesVisibility && matchesTaskGroup && matchesQuery;
      }),
    [responsibleFilter, searchQuery, staffById, taskGroupFilter, tasks, visibilityFilter],
  );
  const activeFilterCount =
    (responsibleFilter === "todos" ? 0 : 1) +
    (visibilityFilter === "todas" ? 0 : 1) +
    (taskGroupFilter === "todos" ? 0 : 1) +
    (hasSearch ? 1 : 0);

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
      staff_ids: getTaskResponsibleIds(task),
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
    return getTaskResponsibleLabel(task, staffById);
  }

  function getPdfResponsibleLabel(task: EventTask) {
    return getTaskResponsibleLabel(task, staffById, "S/R");
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
    setTaskGroupFilter("todos");
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
              <td>${escapeHtml(getPdfResponsibleLabel(task))}</td>
            </tr>
          `;
      })
      .join("");
  }

  function printFilteredTasks(guidelinesHtml = "") {
    if (!event || filteredTasks.length === 0) {
      return;
    }

    const safeGuidelinesHtml = sanitizeGuidelinesHtml(guidelinesHtml);
    const guidelinesSection = safeGuidelinesHtml
      ? `
        <section class="guidelines">
          <div class="section-label">Lineamientos y Avisos</div>
          <div class="guidelines-content">${safeGuidelinesHtml}</div>
        </section>
      `
      : "";
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
            .guidelines {
              margin: 0 24px 24px;
              padding: 20px;
              border: 1px solid #bae6fd;
              border-radius: 18px;
              background: #f0fdfa;
              break-inside: avoid;
            }
            .section-label {
              margin-bottom: 12px;
              color: #0f766e;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 0.14em;
              text-transform: uppercase;
            }
            .guidelines-content {
              color: #172033;
              font-size: 13px;
              line-height: 1.65;
            }
            .guidelines-content h2,
            .guidelines-content h3,
            .guidelines-content h4 {
              margin: 0.35rem 0 0.5rem;
              color: #0f172a;
              line-height: 1.25;
            }
            .guidelines-content h2 { font-size: 20px; }
            .guidelines-content h3 { font-size: 17px; }
            .guidelines-content h4 { font-size: 15px; }
            .guidelines-content p,
            .guidelines-content div {
              margin: 0 0 0.65rem;
            }
            .guidelines-content ul,
            .guidelines-content ol {
              margin: 0.35rem 0 0.75rem;
              padding-left: 1.35rem;
            }
            .guidelines-content ul {
              list-style-type: disc;
            }
            .guidelines-content ol {
              list-style-type: decimal;
            }
            .guidelines-content li {
              display: list-item;
              margin: 0.2rem 0;
            }
            .guidelines-content a {
              color: #0369a1;
              font-weight: 700;
              text-decoration: underline;
            }
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
            ${guidelinesSection}
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

  async function handlePrintRequest() {
    if (!event || filteredTasks.length === 0 || loadingGuidelinesForPdf) {
      return;
    }

    setLoadingGuidelinesForPdf(true);
    setError(null);

    try {
      const payload = await adminFetch("/api/admin/guidelines-notices");
      const safeHtml = sanitizeGuidelinesHtml(payload.html ?? "");

      if (payload.hasContent && safeHtml) {
        setPendingGuidelinesHtml(safeHtml);
        setGuidelinesPdfModalOpen(true);
      } else {
        printFilteredTasks();
      }
    } catch {
      setError("No se pudieron cargar los lineamientos y avisos. Se generara el PDF sin esa seccion.");
      printFilteredTasks();
    } finally {
      setLoadingGuidelinesForPdf(false);
    }
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

  async function assignResponsiblesAutomatically(mode: "complete" | "replace") {
    if (!eventId) {
      return;
    }

    setAssignModalOpen(false);
    setAssigning(true);
    setError(null);

    try {
      const result = await adminFetch(`/api/admin/events/${eventId}/tasks/assign-responsibles`, {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      const repeatNote = result.unavoidableRepeats
        ? ` ${result.unavoidableRepeats} bloque(s) repitieron responsable por falta de alternativas recientes.`
        : "";
      const shortageNote = result.candidateShortages
        ? ` ${result.candidateShortages} bloque(s) tuvieron candidatos permitidos insuficientes.`
        : "";
      setToastMessage(
        `Asignacion lista: ${result.updated ?? 0} actualizadas, ${result.incomplete ?? 0} incompletas, ${result.unchanged ?? 0} sin cambios.${repeatNote}${shortageNote}`,
      );
      await loadTasks();
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "No se pudieron asignar responsables.");
    } finally {
      setAssigning(false);
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
        <div className="grid gap-5 xl:grid-cols-[minmax(520px,1.25fr)_minmax(420px,0.75fr)]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[minmax(260px,1fr)_180px]">
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
            </div>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Field label="Responsables">
              <select
                multiple
                size={5}
                value={form.staff_ids}
                onChange={(event) =>
                  setForm((current) => ({ ...current, staff_ids: getSelectValues(event.target) }))
                }
                className="h-32 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-blue-300"
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
            </div>
            <label className="flex h-11 items-center gap-3 rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-gray-200">
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
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-blue-300 px-4 font-semibold text-zinc-950 transition hover:bg-blue-200 disabled:opacity-60"
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
          </div>
        </div>
      </form>

      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 bg-white/[0.04] p-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(620px,1fr)_260px] xl:items-end">
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-3">
                <Field label="Filtrar responsable">
                  <select
                    value={responsibleFilter}
                    onChange={(event) => setResponsibleFilter(event.target.value as ResponsibleFilter)}
                    className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
                  >
                    <option className="bg-white text-zinc-950" value="todos">Todos los responsables</option>
                    {responsibleOptions.assignedStaff.map((member) => (
                      <option className="bg-white text-zinc-950" key={member.id} value={member.id}>
                        {member.name}
                        {member.is_active ? "" : " (inactivo)"}
                      </option>
                    ))}
                    {responsibleOptions.hasUnassigned ? (
                      <option className="bg-white text-zinc-950" value="sin_responsable">Sin responsable</option>
                    ) : null}
                  </select>
                </Field>
                <Field label="Filtrar grupo de tareas">
                  <select
                    value={taskGroupFilter}
                    onChange={(event) => setTaskGroupFilter(event.target.value as TaskGroupFilter)}
                    className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
                  >
                    <option className="bg-white text-zinc-950" value="todos">Todos los grupos</option>
                    {taskGroupOptions.groups.map((group) => (
                      <option className="bg-white text-zinc-950" key={group.id} value={group.id}>
                        {group.name}
                        {group.is_active ? "" : " (inactivo)"}
                      </option>
                    ))}
                    {taskGroupOptions.hasUngrouped ? (
                      <option className="bg-white text-zinc-950" value="sin_grupo">Sin grupo</option>
                    ) : null}
                  </select>
                </Field>
                <Field label="Filtrar visibilidad">
                  <select
                    value={visibilityFilter}
                    onChange={(event) => setVisibilityFilter(event.target.value as VisibilityFilter)}
                    className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
                  >
                    <option className="bg-white text-zinc-950" value="todas">Todas</option>
                    <option className="bg-white text-zinc-950" value="interna">Interna</option>
                    <option className="bg-white text-zinc-950" value="publica">Publica</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(300px,1fr)_150px_44px] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-300">Buscar tareas</span>
                  <div className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 focus-within:border-blue-300">
                    <Search className="h-4 w-4 text-gray-500" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                      placeholder="Tarea, descripcion, hora, responsable..."
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
                <div className="rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-gray-300">
                  <span className="block font-semibold text-white">
                    {filteredTasks.length} de {tasks.length}
                  </span>
                  <span className="text-xs text-gray-500">
                    {activeFilterCount ? `${activeFilterCount} filtro(s)` : "Sin filtros"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={activeFilterCount === 0}
                  className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  title="Limpiar filtros"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Link
                href="/admin/staff-task-history"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-teal-300/30 bg-teal-300/10 px-4 text-sm font-semibold text-teal-100 transition hover:bg-teal-300/15"
              >
                <History className="h-4 w-4" />
                Historial staff
              </Link>
              <button
                type="button"
                onClick={handlePrintRequest}
                disabled={!event || filteredTasks.length === 0 || loadingGuidelinesForPdf}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingGuidelinesForPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                <span>{loadingGuidelinesForPdf ? "Preparando..." : "Generar PDF"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const hasAssignedTasks = tasks.some((task) => getTaskResponsibleIds(task).length > 0);

                  if (hasAssignedTasks) {
                    setAssignModalOpen(true);
                  } else {
                    assignResponsiblesAutomatically("complete");
                  }
                }}
                disabled={!event || tasks.length === 0 || saving || assigning}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {assigning ? "Asignando..." : "Asignar responsables"}
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
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Tarea</th>
                  <th className="px-5 py-4">Hora</th>
                  <th className="px-5 py-4">Responsable</th>
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
      <AssignResponsiblesDialog
        loading={assigning}
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onComplete={() => assignResponsiblesAutomatically("complete")}
        onReplace={() => assignResponsiblesAutomatically("replace")}
      />
      <GuidelinesPdfDialog
        open={guidelinesPdfModalOpen}
        onCancel={() => setGuidelinesPdfModalOpen(false)}
        onInclude={() => {
          setGuidelinesPdfModalOpen(false);
          printFilteredTasks(pendingGuidelinesHtml);
        }}
        onSkip={() => {
          setGuidelinesPdfModalOpen(false);
          printFilteredTasks();
        }}
      />
      {assigning ? (
        <div className="fixed inset-0 z-[1100] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-lg border border-emerald-300/30 bg-[#111116] p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-300/10 text-emerald-200">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Asignando responsables</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Estamos revisando tareas, defaults y personal activo. Esto puede tardar unos segundos.
            </p>
          </div>
        </div>
      ) : null}
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

function AssignResponsiblesDialog({
  loading,
  onCancel,
  onComplete,
  onReplace,
  open,
}: {
  loading: boolean;
  onCancel: () => void;
  onComplete: () => void;
  onReplace: () => void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-[#111116] p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
              Asignacion automatica
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Ya hay responsables asignados</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Elige si el sistema debe conservarlos y completar faltantes, o recalcular las listas desde cero.
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onComplete}
            disabled={loading}
            className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-4 text-left transition hover:bg-emerald-300/15 disabled:opacity-60"
          >
            <span className="block font-semibold text-emerald-100">Completar faltantes</span>
            <span className="mt-2 block text-sm leading-5 text-gray-400">
              Conserva responsables actuales y agrega solo donde falten cupos.
            </span>
          </button>
          <button
            type="button"
            onClick={onReplace}
            disabled={loading}
            className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-4 text-left transition hover:bg-amber-300/15 disabled:opacity-60"
          >
            <span className="block font-semibold text-amber-100">Reemplazar</span>
            <span className="mt-2 block text-sm leading-5 text-gray-400">
              Borra asignaciones actuales y vuelve a repartir con defaults y aleatorio.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function GuidelinesPdfDialog({
  onCancel,
  onInclude,
  onSkip,
  open,
}: {
  onCancel: () => void;
  onInclude: () => void;
  onSkip: () => void;
  open: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-cyan-300/20 bg-[#111116] p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
              Generar PDF
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Incluir lineamientos y avisos</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Hay lineamientos guardados. Puedes anexarlos al reporte de tareas o generar el PDF solo con la tabla filtrada.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-gray-500 transition hover:bg-white/10 hover:text-white"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onSkip}
            className="h-11 rounded-md border border-white/10 px-4 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            Sin lineamientos
          </button>
          <button
            type="button"
            onClick={onInclude}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-200"
          >
            <FileText className="h-4 w-4" />
            Incluir lineamientos
          </button>
        </div>
      </div>
    </div>
  );
}
