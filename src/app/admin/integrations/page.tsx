"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MessageCircle,
} from "lucide-react";

import { AdminToast } from "@/components/admin/AdminToast";

type EventRecord = {
  id: string;
  celebratory_name: string;
  event_date: string;
  start_time: string;
  token_unico: string;
  clients: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
};

type NotifyResult = {
  mode: "api" | "fallback";
  provider: string;
  url?: string;
  reason?: string;
};

export default function IntegrationsPage() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId],
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

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      try {
        const payload = await adminFetch("/api/admin/events");
        const nextEvents = payload.events ?? [];

        if (!ignore) {
          setEvents(nextEvents);

          if (nextEvents.length > 0) {
            setSelectedEventId(nextEvents[0].id);
          }
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar eventos.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      ignore = true;
    };
  }, [adminFetch]);

  async function sendWhatsApp() {
    if (!selectedEvent) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const result = (await adminFetch(`/api/admin/events/${selectedEvent.id}/notify`, {
        method: "POST",
      })) as NotifyResult;

      if (result.mode === "fallback" && result.url) {
        window.open(result.url, "_blank", "noopener,noreferrer");
        setToastMessage("Se abrio WhatsApp Web con el mensaje preparado.");
      } else {
        setToastMessage("Notificacion enviada por WhatsApp Cloud API.");
      }
    } catch (notifyError) {
      setError(
        notifyError instanceof Error ? notifyError.message : "No se pudo enviar la notificacion.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
          Integraciones
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Pulido y salida a operacion</h1>
        <p className="mt-2 max-w-3xl text-gray-400">
          Envia links de cuestionario al cliente usando WhatsApp Cloud API o WhatsApp Web.
        </p>
      </header>

      {error ? (
        <div className="rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="max-w-4xl">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md border border-emerald-300/25 bg-emerald-400/10 text-emerald-200">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">WhatsApp al cliente</h2>
              <p className="text-sm text-gray-400">
                Usa Cloud API si esta configurada; si no, abre WhatsApp Web con el mensaje listo.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">Evento</span>
              <select
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
                className="h-11 w-full rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none focus:border-emerald-300"
              >
                {loading ? <option>Cargando...</option> : null}
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.event_date} · {event.celebratory_name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={sendWhatsApp}
              disabled={!selectedEvent || sending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 font-semibold text-zinc-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              Enviar link
            </button>
          </div>

          {selectedEvent ? (
            <div className="mt-5 rounded-md border border-white/10 bg-zinc-950 p-4 text-sm text-gray-300">
              <p className="font-semibold text-white">{selectedEvent.clients?.full_name || "Cliente sin nombre"}</p>
              <p className="mt-1">Telefono: {selectedEvent.clients?.phone || "Sin telefono"}</p>
              <p className="mt-1 break-all">
                Link: {typeof window !== "undefined" ? `${window.location.origin}/event/${selectedEvent.token_unico}` : ""}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <AdminToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
