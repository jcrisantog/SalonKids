"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Bot, Loader2, MessageCircle, Mic, MicOff, Send, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AssistantLink = {
  label: string;
  href: string;
};

type AssistantApiResponse = {
  answer: string;
  steps: string[];
  links: AssistantLink[];
};

type AssistantActionPlan = {
  type: string;
  summary: string;
  details: string[];
  requiresStrongConfirmation: boolean;
};

type AssistantPlanApiResponse =
  | (AssistantApiResponse & { kind: "informational" })
  | {
      kind: "clarification_required";
      message: string;
      options: Array<{ label: string; value: string }>;
    }
  | {
      kind: "unsupported";
      message: string;
      steps: string[];
    }
  | {
      kind: "confirmation_required";
      planId: string;
      planToken: string;
      plan: AssistantActionPlan;
    };

type AssistantExecuteApiResponse =
  | {
      kind: "executed";
      message: string;
      resultLabel: string;
    }
  | {
      kind: "rejected";
      message: string;
    };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  steps?: string[];
  links?: AssistantLink[];
  actionPlan?: {
    planId: string;
    planToken: string;
    plan: AssistantActionPlan;
    status: "pending" | "executing" | "executed" | "cancelled";
  };
};

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEvent = Event & {
  error?: string;
};

type BrowserSpeechRecognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const initialMessage: ChatMessage = {
  id: "initial",
  role: "assistant",
  content: "Hola. Puedo guiarte con eventos, cuestionarios, tareas, reglas, staff, asignaciones, historiales y reportes.",
  links: [
    { label: "Eventos", href: "/admin/events" },
    { label: "Reglas Cuestionario", href: "/admin/questionnaire-rules" },
  ],
};

export function AdminAssistantChat() {
  const pathname = usePathname();
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [executingPlanId, setExecutingPlanId] = useState<string | null>(null);

  const canSend = input.trim().length > 0 && !loading;
  const panelTitle = useMemo(() => {
    if (pathname.includes("/admin/events/") && pathname.includes("/tasks")) {
      return "Asistente de tareas";
    }

    if (pathname.includes("/admin/questionnaire-rules")) {
      return "Asistente de reglas";
    }

    return "Asistente admin";
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [error, loading, messages, open, voiceNotice]);

  async function sendMessage() {
    const nextInput = input.trim();

    if (!nextInput || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: nextInput,
    };

    setInput("");
    setError(null);
    setVoiceNotice(null);
    setLoading(true);
    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const response = await fetch("/api/admin/assistant/actions/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nextInput,
          currentPath: pathname,
        }),
      });
      const payload = (await response.json()) as AssistantPlanApiResponse | { error?: string };

      if (!response.ok) {
        throw new Error("error" in payload && payload.error ? payload.error : "No se pudo consultar el asistente.");
      }

      const assistantMessage = buildAssistantMessage(payload as AssistantPlanApiResponse);

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "No se pudo consultar el asistente.");
    } finally {
      setLoading(false);
    }
  }

  async function executePlan(messageId: string, planToken: string, strongConfirmation: boolean) {
    setError(null);
    setExecutingPlanId(messageId);
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId && message.actionPlan
          ? { ...message, actionPlan: { ...message.actionPlan, status: "executing" as const } }
          : message,
      ),
    );

    try {
      const response = await fetch("/api/admin/assistant/actions/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planToken,
          confirmation: strongConfirmation ? "strong_confirmed" : "confirmed",
        }),
      });
      const payload = (await response.json()) as AssistantExecuteApiResponse | { error?: string };

      if (!response.ok || ("kind" in payload && payload.kind === "rejected")) {
        throw new Error("message" in payload ? payload.message : "No se pudo ejecutar la accion.");
      }

      const executedPayload = payload as Extract<AssistantExecuteApiResponse, { kind: "executed" }>;

      setMessages((currentMessages) => [
        ...currentMessages.map((message) =>
          message.id === messageId && message.actionPlan
            ? { ...message, actionPlan: { ...message.actionPlan, status: "executed" as const } }
            : message,
        ),
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: executedPayload.resultLabel,
        },
      ]);
    } catch (executeError) {
      setError(executeError instanceof Error ? executeError.message : "No se pudo ejecutar la accion.");
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId && message.actionPlan
            ? { ...message, actionPlan: { ...message.actionPlan, status: "pending" as const } }
            : message,
        ),
      );
    } finally {
      setExecutingPlanId(null);
    }
  }

  function cancelPlan(messageId: string) {
    setMessages((currentMessages) => [
      ...currentMessages.map((message) =>
        message.id === messageId && message.actionPlan
          ? { ...message, actionPlan: { ...message.actionPlan, status: "cancelled" as const } }
          : message,
      ),
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Accion cancelada. No modifique datos.",
      },
    ]);
  }

  async function toggleVoiceInput() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceNotice("Este navegador no soporta dictado por voz. Puedes escribir tu pregunta.");
      return;
    }

    const microphoneError = await getMicrophoneAccessError();

    if (microphoneError) {
      setVoiceNotice(microphoneError);
      setListening(false);
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "es-MX";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setVoiceNotice("Escuchando...");
      setListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        setInput((currentInput) => `${currentInput} ${transcript}`.trim());
        setVoiceNotice("Dictado listo. Revisa el texto y envialo.");
      }
    };

    recognition.onerror = (event) => {
      setVoiceNotice(getVoiceErrorMessage(event.error));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setVoiceNotice("Preparando microfono...");

    try {
      recognition.start();
    } catch {
      setVoiceNotice("No se pudo iniciar el dictado. Cierra otros dictados abiertos e intenta de nuevo.");
      setListening(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[70] flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        aria-label="Abrir asistente administrativo"
        title="Asistente administrativo"
      >
        <MessageCircle size={22} />
      </button>

      {open ? (
        <div className="pointer-events-none fixed bottom-3 right-3 z-[80] flex w-[calc(100vw-24px)] max-w-[440px] items-end justify-end sm:bottom-5 sm:right-5">
          <section className="pointer-events-auto flex h-[min(680px,calc(100vh-24px))] w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111214] text-white shadow-2xl shadow-black/50">
            <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cyan-400 text-slate-950">
                  <Bot size={20} />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">{panelTitle}</h2>
                  <p className="truncate text-xs text-gray-400">Guia informativa del panel</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-gray-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar asistente"
                title="Cerrar"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <article
                  key={message.id}
                  className={`rounded-lg border px-3 py-3 text-sm ${
                    message.role === "user"
                      ? "ml-8 border-cyan-300/20 bg-cyan-400/10 text-cyan-50"
                      : "mr-8 border-white/10 bg-white/[0.04] text-gray-100"
                  }`}
                >
                  <p className="leading-6">{message.content}</p>
                  {message.steps && message.steps.length > 0 ? (
                    <ol className="mt-3 list-decimal space-y-1 pl-5 text-gray-300">
                      {message.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  ) : null}
                  {message.links && message.links.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.links.map((link) => (
                        <Link
                          key={`${message.id}-${link.href}`}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="rounded-md border border-cyan-300/20 px-2.5 py-1.5 text-xs font-medium text-cyan-200 transition hover:border-cyan-200/50 hover:bg-cyan-300/10"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {message.actionPlan ? (
                    <div
                      className={`mt-3 rounded-md border p-3 ${
                        message.actionPlan.plan.requiresStrongConfirmation
                          ? "border-red-300/30 bg-red-500/10"
                          : "border-cyan-300/20 bg-cyan-400/10"
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                        {message.actionPlan.plan.requiresStrongConfirmation
                          ? "Confirmacion reforzada"
                          : "Confirmacion requerida"}
                      </p>
                      <p className="mt-2 font-medium text-white">{message.actionPlan.plan.summary}</p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-300">
                        {message.actionPlan.plan.details.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void executePlan(
                              message.id,
                              message.actionPlan!.planToken,
                              message.actionPlan!.plan.requiresStrongConfirmation,
                            )
                          }
                          disabled={message.actionPlan.status !== "pending" || executingPlanId === message.id}
                          className={`rounded-md px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            message.actionPlan.plan.requiresStrongConfirmation
                              ? "bg-red-300 text-red-950 hover:bg-red-200"
                              : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                          }`}
                        >
                          {message.actionPlan.status === "executing"
                            ? "Ejecutando..."
                            : message.actionPlan.plan.requiresStrongConfirmation
                              ? "Confirmar accion"
                              : "Confirmar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelPlan(message.id)}
                          disabled={message.actionPlan.status !== "pending" || executingPlanId === message.id}
                          className="rounded-md border border-white/10 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        {message.actionPlan.status === "executed" ? (
                          <span className="rounded-md bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200">
                            Ejecutada
                          </span>
                        ) : null}
                        {message.actionPlan.status === "cancelled" ? (
                          <span className="rounded-md bg-zinc-500/10 px-3 py-2 text-xs font-semibold text-zinc-300">
                            Cancelada
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </article>
              ))}

              {loading ? (
                <div className="mr-8 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-gray-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparando respuesta...
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 p-3">
              {error ? (
                <div className="mb-2 flex items-start gap-2 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
              {voiceNotice ? (
                <div className="mb-2 rounded-md border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
                  {voiceNotice}
                </div>
              ) : null}
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  rows={2}
                  className="min-h-11 flex-1 resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-300/50"
                  placeholder="Pregunta que quieres hacer..."
                />
                <button
                  type="button"
                  onClick={() => void toggleVoiceInput()}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border transition ${
                    listening
                      ? "border-red-300/40 bg-red-500/20 text-red-100"
                      : "border-white/10 bg-white/5 text-gray-200 hover:border-cyan-300/40 hover:text-cyan-100"
                  }`}
                  aria-label={listening ? "Detener dictado" : "Dictar pregunta"}
                  title={listening ? "Detener dictado" : "Dictar"}
                >
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!canSend}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-gray-500"
                  aria-label="Enviar pregunta"
                  title="Enviar"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function buildAssistantMessage(payload: AssistantPlanApiResponse): ChatMessage {
  if (payload.kind === "informational") {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: payload.answer,
      steps: payload.steps,
      links: payload.links,
    };
  }

  if (payload.kind === "confirmation_required") {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Revise este plan antes de ejecutarlo.",
      actionPlan: {
        planId: payload.planId,
        planToken: payload.planToken,
        plan: payload.plan,
        status: "pending",
      },
    };
  }

  if (payload.kind === "clarification_required") {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: payload.message,
      steps: payload.options.map((option) => option.label),
    };
  }

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: payload.message,
    steps: payload.steps,
  };
}

async function getMicrophoneAccessError() {
  if (!window.isSecureContext && window.location.hostname !== "localhost") {
    return "El dictado requiere una conexion segura. Abre el sistema con HTTPS o desde localhost.";
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    return "Este navegador no permite revisar el microfono. Puedes escribir tu pregunta.";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());

    return null;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError" || error.name === "SecurityError") {
        return "El permiso del microfono esta bloqueado. Permite el microfono en el navegador e intenta otra vez.";
      }

      if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        return "No se encontro un microfono disponible. Conecta o habilita uno y vuelve a intentar.";
      }

      if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        return "El microfono esta ocupado por otra aplicacion o no se pudo abrir. Cierra otros programas e intenta otra vez.";
      }
    }

    return "No se pudo acceder al microfono. Puedes seguir escribiendo.";
  }
}

function getVoiceErrorMessage(error?: string) {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "El permiso del microfono o del dictado esta bloqueado. Revisa permisos del sitio e intenta otra vez.";
    case "no-speech":
      return "No escuche ninguna voz. Presiona el microfono y habla de nuevo.";
    case "audio-capture":
      return "No se pudo capturar audio del microfono. Revisa que este conectado y disponible.";
    case "network":
      return "El servicio de dictado del navegador no respondio. Puedes escribir la pregunta.";
    case "aborted":
      return "Dictado detenido.";
    default:
      return "No se pudo usar el dictado por voz. Puedes seguir escribiendo.";
  }
}
