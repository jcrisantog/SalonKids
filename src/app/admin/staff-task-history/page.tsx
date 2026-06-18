"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, FileText, History, Loader2, Users, X } from "lucide-react";

type EventSummary = {
  id: string;
  celebratory_name: string;
  event_date: string;
  start_time: string;
  end_time?: string | null;
};

type StaffSummary = {
  id: string;
  name: string;
  primary_role: string | null;
  is_active: boolean;
};

type HistoryEntry = {
  id: string;
  event: EventSummary;
  staffId: string;
  taskName: string;
  scheduledTime: string | null;
  status: string | null;
  activity: {
    key: string;
    label: string;
    source: "group" | "legacy_group" | "master_task" | "task_name";
  };
};

type HistoryMember = {
  staff: StaffSummary;
  entries: HistoryEntry[];
  summary: Array<{
    activityKey: string;
    activityLabel: string;
    count: number;
  }>;
};

type HistoryPayload = {
  events: EventSummary[];
  members: HistoryMember[];
};

type SortField = "event" | "task";
type SortDirection = "asc" | "desc";

const statusLabels: Record<string, string> = {
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

function formatTime(value: string | null) {
  return value?.slice(0, 5) || "Sin hora";
}

function formatStatus(value: string | null) {
  return value ? statusLabels[value] ?? value : "Sin estado";
}

export default function StaffTaskHistoryPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [members, setMembers] = useState<HistoryMember[]>([]);
  const [staffFilter, setStaffFilter] = useState("todos");
  const [eventFilter, setEventFilter] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("event");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const allStaff = useMemo(
    () => [...members].sort((a, b) => a.staff.name.localeCompare(b.staff.name)),
    [members],
  );
  const summarizeEntries = useCallback((entries: HistoryEntry[]) => {
    const summaryByActivity = new Map<string, { activityKey: string; activityLabel: string; count: number }>();

    for (const entry of entries) {
      const existing = summaryByActivity.get(entry.activity.key) ?? {
        activityKey: entry.activity.key,
        activityLabel: entry.activity.label,
        count: 0,
      };

      existing.count += 1;
      summaryByActivity.set(entry.activity.key, existing);
    }

    return Array.from(summaryByActivity.values()).sort((a, b) => b.count - a.count || a.activityLabel.localeCompare(b.activityLabel));
  }, []);
  const visibleMembers = useMemo(
    () =>
      members
        .filter((member) => staffFilter === "todos" || member.staff.id === staffFilter)
        .map((member) => {
          const entries = member.entries
            .filter((entry) => eventFilter === "todos" || entry.event.id === eventFilter)
            .sort((a, b) => {
              const direction = sortDirection === "asc" ? 1 : -1;

              if (sortField === "task") {
                const taskComparison = a.taskName.localeCompare(b.taskName);

                if (taskComparison !== 0) {
                  return taskComparison * direction;
                }
              }

              const eventComparison =
                a.event.event_date.localeCompare(b.event.event_date) ||
                a.event.celebratory_name.localeCompare(b.event.celebratory_name);

              if (eventComparison !== 0) {
                return eventComparison * direction;
              }

              return (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? "");
            });

          return {
            ...member,
            entries,
            summary: summarizeEntries(entries),
          };
        }),
    [eventFilter, members, sortDirection, sortField, staffFilter, summarizeEntries],
  );
  const visibleEntries = useMemo(
    () => visibleMembers.flatMap((member) => member.entries.map((entry) => ({ ...entry, staff: member.staff }))),
    [visibleMembers],
  );
  const totalAssignments = visibleMembers.reduce((total, member) => total + member.entries.length, 0);
  const activeFilterCount = (staffFilter === "todos" ? 0 : 1) + (eventFilter === "todos" ? 0 : 1);

  const adminFetch = useCallback(async (path: string) => {
    const response = await fetch(path, {
      headers: { "Content-Type": "application/json" },
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Ocurrio un error.");
    }

    return payload as HistoryPayload;
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadInitialHistory() {
      try {
        const payload = await adminFetch("/api/admin/staff-task-history");

        if (!ignore) {
          setEvents(payload.events ?? []);
          setMembers(payload.members ?? []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el historial.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialHistory();

    return () => {
      ignore = true;
    };
  }, [adminFetch]);

  function resetFilters() {
    setStaffFilter("todos");
    setEventFilter("todos");
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection(field === "event" ? "desc" : "asc");
  }

  function getStaffFilterLabel() {
    if (staffFilter === "todos") {
      return "Todo el personal";
    }

    return members.find((member) => member.staff.id === staffFilter)?.staff.name ?? "Personal filtrado";
  }

  function getEventFilterLabel() {
    if (eventFilter === "todos") {
      return "Ultimos 5 eventos";
    }

    return events.find((event) => event.id === eventFilter)?.celebratory_name ?? "Evento filtrado";
  }

  function buildPrintSummaryRows() {
    return visibleMembers
      .map((member) => {
        const summary = member.summary.length
          ? member.summary
              .map((item) => `${escapeHtml(item.activityLabel)} (${item.count})`)
              .join("<br />")
          : "Sin actividades recientes";

        return `
          <tr>
            <td>${escapeHtml(member.staff.name)}${member.staff.is_active ? "" : " <span class=\"muted\">(inactivo)</span>"}</td>
            <td>${member.entries.length}</td>
            <td>${summary}</td>
          </tr>
        `;
      })
      .join("");
  }

  function buildPrintDetailRows() {
    return visibleEntries
      .map(
        (entry) => `
          <tr>
            <td>${escapeHtml(entry.staff.name)}</td>
            <td>${escapeHtml(entry.event.celebratory_name)}<br /><span class="muted">${escapeHtml(entry.event.event_date)}</span></td>
            <td>${escapeHtml(formatTime(entry.scheduledTime))}</td>
            <td>${escapeHtml(entry.taskName)}<br /><span class="muted">${escapeHtml(entry.activity.label)}</span></td>
            <td>${escapeHtml(formatStatus(entry.status))}</td>
          </tr>
        `,
      )
      .join("");
  }

  function printHistory() {
    if (visibleEntries.length === 0 || printing) {
      setError("No hay historial visible para imprimir.");
      return;
    }

    setPrinting(true);
    setError(null);

    const printWindow = window.open("", "_blank", "width=1040,height=760");

    if (!printWindow) {
      setError("No se pudo abrir la ventana de impresion. Revisa el bloqueador de ventanas.");
      setPrinting(false);
      return;
    }

    const generatedAt = new Date().toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    printWindow.document.write(`<!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Historial de tareas del personal</title>
          <style>
            @page { size: letter; margin: 14mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background: #f8fafc;
              color: #172033;
              font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            .page {
              min-height: 100vh;
              background: linear-gradient(145deg, #ffffff 0%, #f7fbff 58%, #eefdf9 100%);
              border: 1px solid #dbeafe;
              border-radius: 18px;
              overflow: hidden;
            }
            header {
              background: linear-gradient(135deg, #0f766e 0%, #2563eb 78%, #f59e0b 125%);
              color: white;
              padding: 28px 32px;
            }
            .eyebrow {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.15em;
              text-transform: uppercase;
              opacity: 0.9;
            }
            h1 {
              margin: 8px 0;
              font-size: 30px;
              line-height: 1.1;
            }
            .subtitle {
              margin: 0;
              font-size: 13px;
              opacity: 0.92;
            }
            .metrics {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              padding: 18px 22px;
              background: rgba(255, 255, 255, 0.82);
            }
            .metric {
              border: 1px solid #dbeafe;
              border-radius: 10px;
              background: white;
              padding: 10px 12px;
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
              margin-top: 4px;
              color: #0f172a;
              font-size: 14px;
            }
            main { padding: 18px 22px 26px; }
            h2 {
              margin: 18px 0 8px;
              color: #0f766e;
              font-size: 14px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0 8px;
              font-size: 12px;
            }
            th {
              padding: 8px 10px;
              color: #475569;
              font-size: 10px;
              text-align: left;
              text-transform: uppercase;
            }
            td {
              padding: 10px;
              background: white;
              border-top: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }
            td:first-child {
              border-left: 5px solid #14b8a6;
              border-radius: 10px 0 0 10px;
              font-weight: 800;
            }
            td:last-child {
              border-right: 1px solid #e2e8f0;
              border-radius: 0 10px 10px 0;
            }
            .muted { color: #64748b; font-size: 11px; font-weight: 500; }
            footer {
              padding: 0 22px 22px;
              color: #64748b;
              font-size: 11px;
              text-align: right;
            }
            @media print {
              body { background: white; }
              .page { border: 0; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <section class="page">
            <header>
              <div class="eyebrow">Historial operativo</div>
              <h1>Rotacion de tareas por personal</h1>
              <p class="subtitle">Generado ${escapeHtml(generatedAt)}</p>
            </header>
            <section class="metrics">
              <div class="metric"><span>Personal</span><strong>${visibleMembers.length}</strong></div>
              <div class="metric"><span>Tareas</span><strong>${totalAssignments}</strong></div>
              <div class="metric"><span>Persona</span><strong>${escapeHtml(getStaffFilterLabel())}</strong></div>
              <div class="metric"><span>Eventos</span><strong>${escapeHtml(getEventFilterLabel())}</strong></div>
            </section>
            <main>
              <h2>Resumen por persona</h2>
              <table>
                <thead><tr><th>Personal</th><th>Tareas</th><th>Actividades realizadas</th></tr></thead>
                <tbody>${buildPrintSummaryRows()}</tbody>
              </table>
              <h2>Detalle de tareas</h2>
              <table>
                <thead><tr><th>Personal</th><th>Evento</th><th>Hora</th><th>Actividad</th><th>Estado</th></tr></thead>
                <tbody>${buildPrintDetailRows()}</tbody>
              </table>
            </main>
            <footer>Salon Kids · Historial basado en los ultimos eventos registrados</footer>
          </section>
          <script>
            window.addEventListener("load", () => {
              window.print();
            });
          </script>
        </body>
      </html>`);
    printWindow.document.close();
    setPrinting(false);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-300">Rotacion operativa</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Historial de tareas del personal</h1>
          <p className="mt-2 text-gray-400">
            Revisa las actividades realizadas por cada persona en los ultimos eventos.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric icon={<Users className="h-5 w-5" />} label="Personal" value={String(visibleMembers.length)} />
          <Metric icon={<History className="h-5 w-5" />} label="Tareas" value={String(totalAssignments)} />
          <Metric icon={<ArrowUpDown className="h-5 w-5" />} label="Orden" value={sortField === "event" ? "Evento" : "Tarea"} />
        </div>
      </header>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_44px_180px] lg:items-end">
          <Field label="Personal">
            <select
              value={staffFilter}
              onChange={(event) => setStaffFilter(event.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-teal-300"
            >
              <option className="bg-white text-zinc-950" value="todos">Todo el personal</option>
              {allStaff.map((member) => (
                <option className="bg-white text-zinc-950" key={member.staff.id} value={member.staff.id}>
                  {member.staff.name}
                  {member.staff.is_active ? "" : " (inactivo)"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Evento">
            <select
              value={eventFilter}
              onChange={(event) => setEventFilter(event.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-teal-300"
            >
              <option className="bg-white text-zinc-950" value="todos">Ultimos 5 eventos</option>
              {events.map((event) => (
                <option className="bg-white text-zinc-950" key={event.id} value={event.id}>
                  {event.event_date} - {event.celebratory_name}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={resetFilters}
            disabled={activeFilterCount === 0}
            className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            title="Limpiar filtros"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={printHistory}
            disabled={visibleEntries.length === 0 || printing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {printing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {printing ? "Preparando..." : "Generar PDF"}
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid min-h-52 place-items-center rounded-lg border border-white/10 bg-white/[0.03]">
          <Loader2 className="h-7 w-7 animate-spin text-teal-300" />
        </div>
      ) : visibleMembers.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center text-gray-500">
          No hay historial que coincida con los filtros.
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleMembers.map((member) => (
            <section key={member.staff.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
              <div className="border-b border-white/10 bg-white/[0.04] p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">{member.staff.name}</h2>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        member.staff.is_active ? "bg-emerald-400/10 text-emerald-200" : "bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {member.staff.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {member.entries.length} tarea(s) en historial reciente
                  </p>
                </div>
              </div>
              {member.entries.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">Esta persona no tiene tareas en los ultimos eventos.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-5 py-4">
                          <SortHeader
                            active={sortField === "event"}
                            direction={sortDirection}
                            label="Evento"
                            onClick={() => toggleSort("event")}
                          />
                        </th>
                        <th className="px-5 py-4">Hora</th>
                        <th className="px-5 py-4">
                          <SortHeader
                            active={sortField === "task"}
                            direction={sortDirection}
                            label="Tarea"
                            onClick={() => toggleSort("task")}
                          />
                        </th>
                        <th className="px-5 py-4">Grupo / actividad</th>
                        <th className="px-5 py-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {member.entries.map((entry) => (
                        <tr key={entry.id} className="transition hover:bg-white/[0.03]">
                          <td className="px-5 py-4">
                            <p className="font-medium text-white">{entry.event.celebratory_name}</p>
                            <p className="mt-1 text-xs text-gray-500">{entry.event.event_date}</p>
                          </td>
                          <td className="px-5 py-4 text-gray-300">{formatTime(entry.scheduledTime)}</td>
                          <td className="px-5 py-4 text-gray-300">{entry.taskName}</td>
                          <td className="px-5 py-4">
                            <span className="inline-flex rounded-md bg-teal-400/10 px-2 py-1 text-xs font-semibold text-teal-100">
                              {entry.activity.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-300">{formatStatus(entry.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
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

function SortHeader({
  active,
  direction,
  label,
  onClick,
}: {
  active: boolean;
  direction: SortDirection;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition ${
        active ? "text-teal-200" : "text-gray-500 hover:text-gray-300"
      }`}
    >
      {label}
      <ArrowUpDown className="h-3.5 w-3.5" />
      {active ? <span className="normal-case tracking-normal">{direction === "asc" ? "Asc" : "Desc"}</span> : null}
    </button>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="text-teal-300">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
