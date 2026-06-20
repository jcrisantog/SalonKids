"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckSquare,
  Clipboard,
  ExternalLink,
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
import {
  questionnaireCompletionLabels,
  type QuestionnaireCompletionStatus,
} from "@/lib/questionnaire-completion";
import { matchesSearch, normalizeSearchText } from "@/lib/search";

type EventStatus = "pendiente" | "guardado" | "validado" | "finalizado";
type DateSortDirection = "desc" | "asc";

type EventRecord = {
  id: string;
  client_id: string | null;
  celebratory_name: string;
  age: number | null;
  parents_names: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  token_unico: string;
  status: EventStatus;
  questionnaire_status: QuestionnaireCompletionStatus;
  questionnaire_completed_at: string | null;
  created_at: string;
  clients: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
};

type EventForm = {
  client_full_name: string;
  client_phone: string;
  client_email: string;
  celebratory_name: string;
  age: string;
  parents_names: string;
  event_date: string;
  start_time: string;
  end_time: string;
  status: EventStatus;
};

const emptyForm: EventForm = {
  client_full_name: "",
  client_phone: "",
  client_email: "",
  celebratory_name: "",
  age: "",
  parents_names: "",
  event_date: "",
  start_time: "13:00",
  end_time: "20:00",
  status: "pendiente",
};

const statusLabels: Record<EventStatus, string> = {
  pendiente: "Pendiente",
  guardado: "Guardado",
  validado: "Validado",
  finalizado: "Finalizado",
};

const questionnaireStatusStyles: Record<QuestionnaireCompletionStatus, string> = {
  sin_iniciar: "bg-zinc-500/10 text-zinc-300",
  en_progreso: "bg-amber-400/10 text-amber-200",
  completado_por_cliente: "bg-emerald-400/10 text-emerald-200",
};

function formatQuestionnaireCompletedAt(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateSortDirection, setDateSortDirection] = useState<DateSortDirection>("desc");

  const upcomingCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    return events.filter((event) => event.event_date >= today).length;
  }, [events]);

  const questionnaireBaseUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/event`;
  }, []);
  const hasSearch = normalizeSearchText(searchQuery).length > 0;
  const visibleEvents = useMemo(
    () => {
      const filteredEvents = events.filter((event) =>
        matchesSearch(searchQuery, [
          event.celebratory_name,
          event.age,
          event.parents_names,
          event.event_date,
          event.start_time?.slice(0, 5),
          event.end_time?.slice(0, 5),
          statusLabels[event.status],
          event.status,
          questionnaireCompletionLabels[event.questionnaire_status],
          event.questionnaire_completed_at,
          event.clients?.full_name,
          event.clients?.phone,
          event.clients?.email,
        ]),
      );

      return [...filteredEvents].sort((firstEvent, secondEvent) => {
        const dateComparison = firstEvent.event_date.localeCompare(secondEvent.event_date);
        const timeComparison = firstEvent.start_time.localeCompare(secondEvent.start_time);
        const comparison = dateComparison || timeComparison;

        return dateSortDirection === "asc" ? comparison : -comparison;
      });
    },
    [dateSortDirection, events, searchQuery],
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

  const fetchEvents = useCallback(async () => {
    const payload = await adminFetch("/api/admin/events");

    return payload.events ?? [];
  }, [adminFetch]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextEvents = await fetchEvents();
      setEvents(nextEvents);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar eventos.");
    } finally {
      setLoading(false);
    }
  }, [fetchEvents]);

  useEffect(() => {
    let ignore = false;

    async function loadInitialEvents() {
      try {
        const nextEvents = await fetchEvents();

        if (!ignore) {
          setEvents(nextEvents);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : "No se pudieron cargar eventos.",
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadInitialEvents();

    return () => {
      ignore = true;
    };
  }, [fetchEvents]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(event: EventRecord) {
    setEditingId(event.id);
    setForm({
      client_full_name: event.clients?.full_name ?? "",
      client_phone: event.clients?.phone ?? "",
      client_email: event.clients?.email ?? "",
      celebratory_name: event.celebratory_name,
      age: event.age ? String(event.age) : "",
      parents_names: event.parents_names ?? "",
      event_date: event.event_date,
      start_time: event.start_time.slice(0, 5),
      end_time: event.end_time.slice(0, 5),
      status: event.status,
    });
  }

  async function handleSubmit(submitEvent: React.FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      age: form.age ? Number(form.age) : null,
    };

    try {
      const response = editingId
        ? await adminFetch(`/api/admin/events/${editingId}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await adminFetch("/api/admin/events", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      const generatedCount = response.generatedTasks?.length ?? 0;
      setToastMessage(
        editingId
          ? `Evento actualizado. Se sincronizaron ${generatedCount} tareas de Entrada/Cierre.`
          : `Evento creado. Se inyectaron ${generatedCount} tareas de Entrada/Cierre.`,
      );
      resetForm();
      await loadEvents();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEvent() {
    if (!deleteTarget) {
      return;
    }

    setError(null);
    setDeletingId(deleteTarget.id);
    const deletedName = deleteTarget.celebratory_name;

    try {
      await adminFetch(`/api/admin/events/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      setToastMessage(`El evento de ${deletedName} fue eliminado.`);
      await loadEvents();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  }

  async function copyQuestionnaireLink(event: EventRecord) {
    const link = `${questionnaireBaseUrl}/${event.token_unico}`;

    await navigator.clipboard.writeText(link);
    setToastMessage(`Link de cuestionario copiado para ${event.celebratory_name}.`);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">Operacion</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="mt-2 text-gray-400">
            Crea fiestas, genera links de cuestionario e inyecta tareas de Entrada/Cierre.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3">
          <CalendarDays className="h-5 w-5 text-blue-300" />
          <div>
            <p className="text-xs text-gray-500">Proximos</p>
            <p className="font-semibold">{upcomingCount} eventos</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Nombre del festejado">
            <input
              value={form.celebratory_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, celebratory_name: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              placeholder="Matias"
              required
            />
          </Field>
          <Field label="Edad">
            <input
              type="number"
              min="1"
              value={form.age}
              onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              placeholder="10"
            />
          </Field>
          <Field label="Estatus">
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value as EventStatus }))
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

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Field label="Fecha">
            <input
              type="date"
              value={form.event_date}
              onChange={(event) =>
                setForm((current) => ({ ...current, event_date: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              required
            />
          </Field>
          <Field label="Hora inicio">
            <input
              type="time"
              value={form.start_time}
              onChange={(event) =>
                setForm((current) => ({ ...current, start_time: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              required
            />
          </Field>
          <Field label="Hora fin">
            <input
              type="time"
              value={form.end_time}
              onChange={(event) =>
                setForm((current) => ({ ...current, end_time: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              required
            />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Field label="Cliente / Anfitrion">
            <input
              value={form.client_full_name}
              onChange={(event) =>
                setForm((current) => ({ ...current, client_full_name: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              placeholder="Maria Esther"
            />
          </Field>
          <Field label="Telefono">
            <input
              value={form.client_phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, client_phone: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              placeholder="55..."
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.client_email}
              onChange={(event) =>
                setForm((current) => ({ ...current, client_email: event.target.value }))
              }
              className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
              placeholder="cliente@email.com"
            />
          </Field>
        </div>

        <Field label="Nombres de papas o anfitriones">
          <input
            value={form.parents_names}
            onChange={(event) =>
              setForm((current) => ({ ...current, parents_names: event.target.value }))
            }
            className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-blue-300"
            placeholder="Maria Esther y Jose"
          />
        </Field>

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
            {editingId ? "Guardar evento" : "Crear evento"}
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
          <label className="block lg:min-w-[360px]">
            <span className="mb-2 block text-sm font-medium text-gray-300">Buscar eventos</span>
            <div className="flex h-11 items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 focus-within:border-blue-300">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                placeholder="Festejado, cliente, fecha, estado..."
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
              {visibleEvents.length} de {events.length} eventos
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
            <Loader2 className="h-7 w-7 animate-spin text-blue-300" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Aun no hay eventos registrados.</div>
        ) : visibleEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay eventos que coincidan con la busqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Evento</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        setDateSortDirection((current) => (current === "desc" ? "asc" : "desc"))
                      }
                      className="inline-flex items-center gap-2 rounded-md text-left transition hover:text-white"
                      title={
                        dateSortDirection === "desc"
                          ? "Ordenar desde la fecha mas vieja"
                          : "Ordenar desde la fecha mas reciente"
                      }
                    >
                      Fecha
                      {dateSortDirection === "desc" ? (
                        <ArrowDown className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUp className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-4">Horario</th>
                  <th className="px-5 py-4">Estatus</th>
                  <th className="px-5 py-4">Cuestionario</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {visibleEvents.map((event) => (
                  <tr key={event.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {event.celebratory_name}
                        {event.age ? `, ${event.age}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {event.parents_names || "Sin anfitriones capturados"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-300">{event.clients?.full_name || "Sin cliente"}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {event.clients?.phone || event.clients?.email || "Sin contacto"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{event.event_date}</td>
                    <td className="px-5 py-4 text-gray-300">
                      {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-md bg-blue-400/10 px-2 py-1 text-xs font-semibold text-blue-200">
                        {statusLabels[event.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${questionnaireStatusStyles[event.questionnaire_status]}`}>
                        {questionnaireCompletionLabels[event.questionnaire_status]}
                      </span>
                      {event.questionnaire_completed_at ? (
                        <p className="mt-1 text-xs text-gray-500">
                          {formatQuestionnaireCompletedAt(event.questionnaire_completed_at)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => copyQuestionnaireLink(event)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Copiar link de cuestionario"
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                        <a
                          href={`/admin/events/${event.id}/tasks`}
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Editar tareas del evento"
                        >
                          <CheckSquare className="h-4 w-4" />
                        </a>
                        <a
                          href={`/event/${event.token_unico}`}
                          target="_blank"
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Abrir cuestionario"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => startEdit(event)}
                          className="grid h-9 w-9 place-items-center rounded-md border border-white/10 text-gray-300 transition hover:bg-white/10"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(event)}
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
        title="Eliminar evento"
        description={`Se eliminara el evento de ${deleteTarget?.celebratory_name ?? "este festejado"} junto con su backlog y cuestionario. Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={Boolean(deletingId)}
        onCancel={() => (deletingId ? null : setDeleteTarget(null))}
        onConfirm={deleteEvent}
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
