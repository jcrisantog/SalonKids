"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  GripVertical,
  Loader2,
  Printer,
  Rows3,
  UserRoundCog,
} from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";

type EventStatus = "pendiente" | "guardado" | "validado" | "finalizado";
type TaskStatus = "pendiente" | "en_progreso" | "completada";

type EventRecord = {
  id: string;
  celebratory_name: string;
  age: number | null;
  event_date: string;
  start_time: string;
  end_time: string;
  token_unico: string;
  status: EventStatus;
  parents_names: string | null;
  clients: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
};

type StaffMember = {
  id: string;
  name: string;
  primary_role: string;
  is_active: boolean;
};

type EventTask = {
  id: string;
  event_id: string;
  task_name: string;
  description: string | null;
  scheduled_time: string | null;
  staff_id: string | null;
  role_responsible: string | null;
  status: TaskStatus;
  visibility: "interna" | "publica";
  is_manual_override: boolean;
};

const columns: Array<{ id: TaskStatus; title: string; tone: string }> = [
  { id: "pendiente", title: "Pendientes", tone: "border-yellow-300/25 bg-yellow-300/5" },
  { id: "en_progreso", title: "En progreso", tone: "border-blue-300/25 bg-blue-300/5" },
  { id: "completada", title: "Completadas", tone: "border-emerald-300/25 bg-emerald-300/5" },
];

const matrixRoles = ["DJ", "Animacion", "Coordinadora", "Apoyo", "Cocina"];

export default function LiveOperationsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeStaff = useMemo(() => staff.filter((member) => member.is_active), [staff]);

  const staffById = useMemo(() => {
    return new Map(staff.map((member) => [member.id, member]));
  }, [staff]);

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

  const fetchInitialData = useCallback(async () => {
    const [eventsPayload, staffPayload] = await Promise.all([
      adminFetch("/api/admin/events"),
      adminFetch("/api/admin/staff"),
    ]);

    return {
      events: eventsPayload.events ?? [],
      staff: staffPayload.staff ?? [],
    };
  }, [adminFetch]);

  const fetchTasks = useCallback(async () => {
    if (!selectedEventId) {
      return null;
    }

    return adminFetch(`/api/admin/events/${selectedEventId}/tasks`);
  }, [adminFetch, selectedEventId]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialData() {
      try {
        const payload = await fetchInitialData();

        if (!ignore) {
          setEvents(payload.events);
          setStaff(payload.staff);

          if (payload.events.length > 0) {
            setSelectedEventId((current) => current || payload.events[0].id);
          }
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : "No se pudo cargar operaciones.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      ignore = true;
    };
  }, [fetchInitialData]);

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    let ignore = false;

    async function loadEventTasks() {
      try {
        const payload = await fetchTasks();

        if (!ignore && payload) {
          setSelectedEvent(payload.event);
          setTasks(payload.tasks ?? []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tareas.");
        }
      }
    }

    loadEventTasks();

    return () => {
      ignore = true;
    };
  }, [fetchTasks, selectedEventId]);

  async function patchTask(task: EventTask, updates: Partial<EventTask>) {
    const nextTask = { ...task, ...updates };
    setSavingTaskId(task.id);
    setError(null);

    try {
      await adminFetch(`/api/admin/events/${task.event_id}/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          task_name: nextTask.task_name,
          description: nextTask.description ?? "",
          scheduled_time: nextTask.scheduled_time?.slice(0, 5) ?? "",
          staff_id: nextTask.staff_id,
          role_responsible: nextTask.role_responsible ?? "",
          status: nextTask.status,
          visibility: nextTask.visibility,
          is_manual_override: true,
        }),
      });

      setTasks((current) =>
        current.map((currentTask) =>
          currentTask.id === task.id ? { ...currentTask, ...updates, is_manual_override: true } : currentTask,
        ),
      );
      setToastMessage("Tarea actualizada.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo actualizar la tarea.");
    } finally {
      setSavingTaskId(null);
    }
  }

  function handleDrop(status: TaskStatus) {
    const task = tasks.find((item) => item.id === dragTaskId);
    setDragTaskId(null);

    if (!task || task.status === status) {
      return;
    }

    patchTask(task, { status });
  }

  const matrixRows = useMemo(() => {
    const grouped = new Map<string, EventTask[]>();

    tasks
      .slice()
      .sort((a, b) => (a.scheduled_time ?? "99:99").localeCompare(b.scheduled_time ?? "99:99"))
      .forEach((task) => {
        const time = task.scheduled_time?.slice(0, 5) || "Sin hora";
        grouped.set(time, [...(grouped.get(time) ?? []), task]);
      });

    return Array.from(grouped.entries());
  }, [tasks]);

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }

          body {
            background: white !important;
            color: black !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 9pt !important;
          }

          .no-print {
            display: none !important;
          }

          .print-area {
            display: block !important;
            color: black !important;
          }

          .print-area * {
            background: transparent !important;
            color: black !important;
            box-shadow: none !important;
          }

          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #111 !important;
            padding: 4px !important;
            vertical-align: top !important;
            word-break: break-word !important;
          }
        }
      `}</style>

      <div className="no-print space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">Live Matrix</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Operacion del evento</h1>
            <p className="mt-2 text-gray-400">
              Mueve tareas entre estados, asigna staff y prepara la matriz compacta para imprimir.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-4 font-semibold text-zinc-950 transition hover:bg-blue-100"
          >
            <Printer className="h-4 w-4" />
            Imprimir matriz
          </button>
        </header>

        <section className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-300">Evento</span>
            <select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(event.target.value)}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
            >
              {events.length === 0 ? <option value="">Sin eventos</option> : null}
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.event_date} · {event.celebratory_name}
                </option>
              ))}
            </select>
          </label>
          <Metric icon={<Rows3 className="h-5 w-5" />} label="Tareas" value={tasks.length} />
          <Metric
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Completadas"
            value={tasks.filter((task) => task.status === "completada").length}
          />
        </section>

        {error ? (
          <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-3">
          {columns.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.id);

            return (
              <div
                key={column.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(column.id)}
                className={`min-h-80 rounded-lg border p-4 ${column.tone}`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold">{column.title}</h2>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-gray-300">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      staff={activeStaff}
                      staffName={task.staff_id ? staffById.get(task.staff_id)?.name : null}
                      saving={savingTaskId === task.id}
                      onDragStart={() => setDragTaskId(task.id)}
                      onAssign={(staffId) => patchTask(task, { staff_id: staffId || null })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <section className="print-area rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="no-print grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-zinc-950 text-blue-200">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Matriz Cruzada Horizontal</h2>
            <p className="text-sm text-gray-400">
              {selectedEvent?.celebratory_name ?? "Evento"} · {selectedEvent?.event_date ?? ""}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="print-table w-full min-w-[980px] table-fixed text-left text-sm">
            <thead className="bg-white/[0.06] text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="w-24 px-3 py-3">Hora</th>
                <th className="px-3 py-3">Hito publico</th>
                {matrixRoles.map((role) => (
                  <th key={role} className="px-3 py-3">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {matrixRows.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-gray-400" colSpan={matrixRoles.length + 2}>
                    Sin tareas para este evento.
                  </td>
                </tr>
              ) : (
                matrixRows.map(([time, rowTasks]) => (
                  <tr key={time}>
                    <td className="px-3 py-3 font-semibold">{time}</td>
                    <td className="px-3 py-3">
                      {rowTasks
                        .filter((task) => task.visibility === "publica")
                        .map((task) => task.task_name)
                        .join(" / ") || "Interno"}
                    </td>
                    {matrixRoles.map((role) => (
                      <td key={role} className="px-3 py-3 align-top">
                        {rowTasks
                          .filter((task) => {
                            const staffMember = task.staff_id ? staffById.get(task.staff_id) : null;
                            const haystack = `${task.role_responsible ?? ""} ${staffMember?.primary_role ?? ""}`;

                            return haystack.toLowerCase().includes(role.toLowerCase());
                          })
                          .map((task) => {
                            const staffMember = task.staff_id ? staffById.get(task.staff_id) : null;

                            return (
                              <div key={task.id} className="mb-2 last:mb-0">
                                <p className="font-medium">{task.task_name}</p>
                                <p className="text-xs text-gray-400">
                                  {staffMember?.name || task.role_responsible || "Sin asignar"}
                                </p>
                              </div>
                            );
                          })}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-950 px-4 py-3">
      <span className="text-blue-300">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );
}

function TaskCard({
  onAssign,
  onDragStart,
  saving,
  staff,
  staffName,
  task,
}: {
  onAssign: (staffId: string) => void;
  onDragStart: () => void;
  saving: boolean;
  staff: StaffMember[];
  staffName: string | null | undefined;
  task: EventTask;
}) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      className="rounded-lg border border-white/10 bg-[#0f0f14] p-4 shadow-lg shadow-black/20"
    >
      <div className="flex items-start gap-3">
        <GripVertical className="mt-1 h-4 w-4 shrink-0 text-gray-600" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{task.task_name}</p>
            <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-gray-400">
              {task.scheduled_time?.slice(0, 5) || "Sin hora"}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-400">
            {task.description || "Sin descripcion operativa."}
          </p>
          <label className="mt-3 block">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <UserRoundCog className="h-3.5 w-3.5" />
              Staff asignado
            </span>
            <select
              value={task.staff_id ?? ""}
              onChange={(event) => onAssign(event.target.value)}
              disabled={saving}
              className="h-10 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-sm text-white outline-none focus:border-blue-300 disabled:opacity-60"
            >
              <option value="">Sin asignar</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.primary_role}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs text-gray-500">
            {saving ? "Guardando..." : staffName ? `Asignado a ${staffName}` : task.role_responsible || "Sin rol sugerido"}
          </p>
        </div>
      </div>
    </article>
  );
}
