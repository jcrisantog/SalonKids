"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpDown, CheckSquare, FileText, Loader2, X } from "lucide-react";

type EventSummary = {
  id: string;
  celebratory_name: string;
  event_date: string;
  start_time: string;
};

type StaffSummary = {
  id: string;
  name: string;
  is_active: boolean;
};

type HistoryEntry = {
  id: string;
  event: EventSummary;
  staffId: string;
  taskName: string;
  scheduledTime: string | null;
  activity: {
    key: string;
    label: string;
  };
};

type HistoryMember = {
  staff: StaffSummary;
  entries: HistoryEntry[];
};

type HistoryPayload = {
  members: HistoryMember[];
};

type TaskHistoryRow = {
  key: string;
  taskKey: string;
  taskName: string;
  event: EventSummary;
  scheduledTime: string | null;
  responsibles: StaffSummary[];
};

type SortDirection = "asc" | "desc";

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

function getResponsibleLabel(responsibles: StaffSummary[]) {
  return responsibles.length
    ? responsibles.map((staff) => `${staff.name}${staff.is_active ? "" : " (inactivo)"}`).join(", ")
    : "Sin responsable";
}

export default function TaskHistoryPage() {
  const [members, setMembers] = useState<HistoryMember[]>([]);
  const [taskFilter, setTaskFilter] = useState("todas");
  const [dateSortDirection, setDateSortDirection] = useState<SortDirection>("desc");
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    async function loadHistory() {
      try {
        const payload = await adminFetch("/api/admin/staff-task-history");

        if (!ignore) {
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

    loadHistory();

    return () => {
      ignore = true;
    };
  }, [adminFetch]);

  const taskRows = useMemo(() => {
    const rows = new Map<string, TaskHistoryRow>();

    for (const member of members) {
      for (const entry of member.entries) {
        const taskKey = `${entry.activity.key}|${entry.taskName}`;
        const key = `${taskKey}|${entry.event.id}|${entry.scheduledTime ?? ""}`;
        const current = rows.get(key) ?? {
          key,
          taskKey,
          taskName: entry.taskName,
          event: entry.event,
          scheduledTime: entry.scheduledTime,
          responsibles: [],
        };

        if (!current.responsibles.some((staff) => staff.id === member.staff.id)) {
          current.responsibles.push(member.staff);
        }

        rows.set(key, current);
      }
    }

    return Array.from(rows.values()).sort((a, b) => {
      const direction = dateSortDirection === "asc" ? 1 : -1;
      const dateComparison = a.event.event_date.localeCompare(b.event.event_date);

      if (dateComparison !== 0) {
        return dateComparison * direction;
      }

      const startComparison = a.event.start_time.localeCompare(b.event.start_time);

      if (startComparison !== 0) {
        return startComparison * direction;
      }

      return (
        a.event.celebratory_name.localeCompare(b.event.celebratory_name) ||
        a.taskName.localeCompare(b.taskName) ||
        (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? "")
      );
    });
  }, [dateSortDirection, members]);

  const taskOptions = useMemo(() => {
    const options = new Map<string, string>();

    for (const row of taskRows) {
      options.set(row.taskKey, row.taskName);
    }

    return Array.from(options.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [taskRows]);

  const visibleRows = useMemo(
    () => taskRows.filter((row) => taskFilter === "todas" || row.taskKey === taskFilter),
    [taskFilter, taskRows],
  );
  const selectedTaskLabel =
    taskFilter === "todas"
      ? "Todas las tareas"
      : taskOptions.find((option) => option.value === taskFilter)?.label ?? "Tarea filtrada";

  function resetFilters() {
    setTaskFilter("todas");
  }

  function toggleDateSortDirection() {
    setDateSortDirection((current) => (current === "asc" ? "desc" : "asc"));
  }

  function buildPrintRows() {
    return visibleRows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.event.event_date)}</td>
            <td>${escapeHtml(row.event.celebratory_name)}${
              taskFilter === "todas" ? `<br /><span class="muted">${escapeHtml(row.taskName)}</span>` : ""
            }</td>
            <td>${escapeHtml(formatTime(row.scheduledTime))}</td>
            <td>${escapeHtml(getResponsibleLabel(row.responsibles))}</td>
          </tr>
        `,
      )
      .join("");
  }

  function printHistory() {
    if (visibleRows.length === 0 || printing) {
      setError("No hay historial visible para imprimir.");
      return;
    }

    setPrinting(true);
    setError(null);

    const printWindow = window.open("", "_blank", "width=980,height=760");

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
          <title>Historial por tarea</title>
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
              background: linear-gradient(145deg, #ffffff 0%, #f7fbff 58%, #fff7ed 100%);
              border: 1px solid #dbeafe;
              border-radius: 18px;
              overflow: hidden;
            }
            header {
              background: linear-gradient(135deg, #7c3aed 0%, #0891b2 78%, #f59e0b 125%);
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
              grid-template-columns: repeat(3, 1fr);
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
              border-left: 5px solid #8b5cf6;
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
              <div class="eyebrow">Historial por tarea</div>
              <h1>${escapeHtml(selectedTaskLabel)}</h1>
              <p class="subtitle">Generado ${escapeHtml(generatedAt)}</p>
            </header>
            <section class="metrics">
              <div class="metric"><span>Tarea</span><strong>${escapeHtml(selectedTaskLabel)}</strong></div>
              <div class="metric"><span>Registros</span><strong>${visibleRows.length}</strong></div>
              <div class="metric"><span>Ventana</span><strong>Ultimos 5 eventos</strong></div>
            </section>
            <main>
              <table>
                <thead><tr><th>Fecha</th><th>Evento</th><th>Hora</th><th>Responsable</th></tr></thead>
                <tbody>${buildPrintRows()}</tbody>
              </table>
            </main>
            <footer>Salon Kids - Historial basado en los ultimos 5 eventos registrados</footer>
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
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">Historial operativo</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Historial por tarea</h1>
          <p className="mt-2 text-gray-400">
            Consulta quien realizo una tarea especifica en los ultimos 5 eventos.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
          <CheckSquare className="h-5 w-5 text-violet-300" />
          <div>
            <p className="text-xs text-gray-500">Registros visibles</p>
            <p className="font-semibold">{visibleRows.length}</p>
          </div>
        </div>
      </header>

      <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_44px_180px] lg:items-end">
          <Field label="Tarea">
            <select
              value={taskFilter}
              onChange={(event) => setTaskFilter(event.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-violet-300"
            >
              <option className="bg-white text-zinc-950" value="todas">Todas las tareas</option>
              {taskOptions.map((option) => (
                <option className="bg-white text-zinc-950" key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <button
            type="button"
            onClick={resetFilters}
            disabled={taskFilter === "todas"}
            className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            title="Limpiar filtros"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={printHistory}
            disabled={visibleRows.length === 0 || printing}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-violet-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
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

      <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
        {loading ? (
          <div className="grid min-h-52 place-items-center">
            <Loader2 className="h-7 w-7 animate-spin text-violet-300" />
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay historial para la tarea seleccionada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">
                    <button
                      type="button"
                      onClick={toggleDateSortDirection}
                      className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:bg-white/10 hover:text-white"
                      title="Ordenar por fecha del evento"
                    >
                      Fecha
                      <ArrowUpDown className="h-3.5 w-3.5" />
                      <span className="normal-case tracking-normal text-gray-500">
                        {dateSortDirection === "asc" ? "Asc" : "Desc"}
                      </span>
                    </button>
                  </th>
                  <th className="px-5 py-4">Evento</th>
                  <th className="px-5 py-4">Hora</th>
                  <th className="px-5 py-4">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleRows.map((row) => (
                  <tr key={row.key} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-medium text-white">{row.event.event_date}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{row.event.celebratory_name}</p>
                      {taskFilter === "todas" ? (
                        <p className="mt-2 text-xs text-violet-200">{row.taskName}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-gray-300">{formatTime(row.scheduledTime)}</td>
                    <td className="px-5 py-4 text-gray-300">{getResponsibleLabel(row.responsibles)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
