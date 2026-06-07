"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react";

import { ParticleField } from "@/components/client/ParticleField";
import {
  emptyQuestionnaire,
  getSectionProgress,
  isFieldVisible,
  normalizeQuestionnaire,
  questionnaireSections,
  type QuestionnaireField,
  type QuestionnaireSection,
} from "@/lib/questionnaire-schema";
import type { GeneratedEventTask, QuestionnaireData } from "@/lib/rule-engine";

type EventSummary = {
  celebratory_name: string;
  age: number | null;
  event_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

type PublicTask = {
  id: string;
  task_name: string;
  description: string | null;
  scheduled_time: string | null;
  role_responsible: string | null;
  visibility: "publica";
  status: string;
};

type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type QuestionnaireClientProps = {
  token: string;
};

const SHOW_PUBLIC_TIMELINE = false;

export default function QuestionnaireClient({ token }: QuestionnaireClientProps) {
  const [event, setEvent] = useState<EventSummary | null>(null);
  const [form, setForm] = useState<QuestionnaireData>(emptyQuestionnaire);
  const [publicTasks, setPublicTasks] = useState<PublicTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedEventTask[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(questionnaireSections[0]?.id ?? "");

  const saveQuestionnaire = useCallback(
    async (questionnaire: QuestionnaireData) => {
      setSaveStatus("saving");
      setError(null);

      const response = await fetch(`/api/client-events/${token}/questionnaire`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionnaire }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo guardar el cuestionario.");
      }

      setGeneratedTasks(payload.generatedTasks ?? []);
      setPublicTasks(payload.publicTasks ?? []);
      setSaveStatus("saved");
    },
    [token],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadQuestionnaire() {
      try {
        const response = await fetch(`/api/client-events/${token}/questionnaire`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "No se pudo cargar el evento.");
        }

        if (isMounted) {
          setEvent(payload.event);
          setForm(normalizeQuestionnaire(payload.questionnaire));
          setPublicTasks(payload.publicTasks ?? []);
          setSaveStatus(payload.updatedAt ? "saved" : "idle");
          setHasLoaded(true);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el evento.");
          setSaveStatus("error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadQuestionnaire();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!hasLoaded || saveStatus !== "dirty") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveQuestionnaire(form).catch((saveError) => {
        setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
        setSaveStatus("error");
      });
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [form, hasLoaded, saveQuestionnaire, saveStatus]);

  const activeSection = useMemo(
    () => questionnaireSections.find((section) => section.id === activeSectionId) ?? questionnaireSections[0],
    [activeSectionId],
  );

  const overallProgress = useMemo(() => {
    const totals = questionnaireSections.map((section) => getSectionProgress(section, form));
    const completed = totals.reduce((sum, progress) => sum + progress.completed, 0);
    const total = totals.reduce((sum, progress) => sum + progress.total, 0);

    return {
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [form]);

  const visibleTaskCount = useMemo(
    () => generatedTasks.filter((task) => task.visibility === "publica").length,
    [generatedTasks],
  );

  const updateField = (
    key: keyof QuestionnaireData,
    value: QuestionnaireData[keyof QuestionnaireData],
  ) => {
    setSaveStatus("dirty");
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleManualSave() {
    try {
      await saveQuestionnaire(form);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar.");
      setSaveStatus("error");
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0b10] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0b0b10] px-6 text-white">
        <div className="max-w-md rounded-lg border border-red-400/30 bg-red-500/10 p-6 text-center text-red-100">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0b0b10] text-white">
      <ParticleField />
      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-3 py-5 sm:gap-7 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
              <Sparkles className="h-4 w-4" />
              Salon Fantasia Extremo Kids
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Cuestionario del evento
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-300">
              {event?.celebratory_name}
              {event?.age ? `, ${event.age} anos` : ""}. Tus respuestas se guardan
              automaticamente y ayudan al equipo a preparar el cronograma y las tareas.
            </p>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              <Calendar className="h-5 w-5 text-fuchsia-300" />
              <span className="min-w-0 break-words">
                {event?.event_date} · {event?.start_time?.slice(0, 5)} -{" "}
                {event?.end_time?.slice(0, 5)}
              </span>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">
              <span className="font-semibold text-white">{overallProgress.percent}%</span>{" "}
              completado
            </div>
          </div>
        </header>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:gap-6">
          <SectionNav
            activeSectionId={activeSection.id}
            form={form}
            onSelect={setActiveSectionId}
            sections={questionnaireSections}
          />

          <QuestionnaireSectionPanel
            form={form}
            onChange={updateField}
            section={activeSection}
          />

          <aside className="min-w-0 space-y-5 lg:sticky lg:top-6 lg:h-fit">
            <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-lg font-semibold">Guardado</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Los cambios se guardan automaticamente despues de escribir.
              </p>
              <SaveBadge status={saveStatus} />
              {error ? (
                <div className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
                  {error}
                </div>
              ) : null}
              {saveStatus === "saved" && generatedTasks.length > 0 ? (
                <div className="mt-4 rounded-md border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                  Se sincronizaron {generatedTasks.length} tareas, {visibleTaskCount} publicas.
                </div>
              ) : null}
              <button
                type="button"
                onClick={handleManualSave}
                disabled={saveStatus === "saving"}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 font-semibold text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveStatus === "saving" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Guardar ahora
              </button>
            </section>

            {SHOW_PUBLIC_TIMELINE ? <Timeline tasks={publicTasks} /> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

function SectionNav({
  activeSectionId,
  form,
  onSelect,
  sections,
}: {
  activeSectionId: string;
  form: QuestionnaireData;
  onSelect: (sectionId: string) => void;
  sections: QuestionnaireSection[];
}) {
  return (
    <nav className="lg:sticky lg:top-6 lg:h-fit">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col lg:overflow-visible lg:pb-0">
        {sections.map((section) => {
          const progress = getSectionProgress(section, form);
          const isActive = section.id === activeSectionId;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              className={`flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-3 text-left transition sm:gap-3 sm:px-3 ${
                isActive
                  ? "border-cyan-300/60 bg-cyan-300/10 text-white"
                  : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25"
              }`}
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 bg-zinc-950 text-xs font-semibold text-cyan-100 sm:h-9 sm:w-9 sm:text-sm">
                {progress.percent}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold leading-4 sm:text-sm">{section.title}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-300" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
              <ChevronRight className="hidden h-4 w-4 shrink-0 lg:block" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function QuestionnaireSectionPanel({
  form,
  onChange,
  section,
}: {
  form: QuestionnaireData;
  onChange: (key: keyof QuestionnaireData, value: QuestionnaireData[keyof QuestionnaireData]) => void;
  section: QuestionnaireSection;
}) {
  const progress = getSectionProgress(section, form);
  const visibleFields = section.fields.filter((field) => isFieldVisible(field, form));

  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cyan-200">{progress.completed} de {progress.total} campos</p>
          <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{section.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">{section.description}</p>
        </div>
        <div className="w-fit rounded-md border border-white/10 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-300 sm:min-w-32">
          <span className="font-semibold text-white">{progress.percent}%</span> listo
        </div>
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {visibleFields.map((field) => (
          <FieldControl
            key={String(field.key)}
            field={field}
            form={form}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function FieldControl({
  field,
  form,
  onChange,
}: {
  field: QuestionnaireField;
  form: QuestionnaireData;
  onChange: (key: keyof QuestionnaireData, value: QuestionnaireData[keyof QuestionnaireData]) => void;
}) {
  const value = form[field.key];
  const baseLabel = (
    <>
      <span className="text-sm font-medium text-zinc-300">{field.label}</span>
      {field.helper ? <span className="mt-1 block text-xs leading-5 text-zinc-500">{field.helper}</span> : null}
    </>
  );

  if (field.type === "boolean") {
    return (
      <label className="flex min-h-12 min-w-0 cursor-pointer items-center justify-between gap-4 rounded-md border border-white/10 bg-zinc-950/60 px-4 py-3">
        <span className="min-w-0 break-words font-medium text-zinc-100">{field.label}</span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.key, event.target.checked)}
          className="h-5 w-5 accent-cyan-300"
        />
      </label>
    );
  }

  if (field.type === "single") {
    return (
      <label className="block min-w-0">
        {baseLabel}
        <select
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="mt-2 h-11 w-full min-w-0 rounded-md border border-white/10 bg-zinc-950 px-3 text-white outline-none transition focus:border-cyan-300"
        >
          <option value="">Selecciona una opcion</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "multi") {
    const selected = Array.isArray(value) ? value : [];

    return (
      <fieldset className="min-w-0 rounded-md border border-white/10 bg-zinc-950/40 p-4 md:col-span-2">
        <legend className="px-1 text-sm font-medium text-zinc-300">{field.label}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(field.options ?? []).map((option) => {
            const checked = selected.includes(option);

            return (
              <label key={option} className="flex min-w-0 items-start gap-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-200">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selected, option]
                      : selected.filter((item) => item !== option);
                    onChange(field.key, next);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-cyan-300"
                />
                <span className="min-w-0 break-words">{option}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block min-w-0 md:col-span-2">
        {baseLabel}
        <textarea
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="mt-2 min-h-28 w-full min-w-0 resize-y rounded-md border border-white/10 bg-white/[0.04] px-3 py-3 text-white outline-none transition focus:border-cyan-300"
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <label className="block min-w-0">
        {baseLabel}
        <input
          type="number"
          min="0"
          value={typeof value === "number" ? value : ""}
          onChange={(event) => onChange(field.key, event.target.value ? Number(event.target.value) : undefined)}
          className="mt-2 h-11 w-full min-w-0 rounded-md border border-white/10 bg-white/[0.04] px-3 text-white outline-none transition focus:border-cyan-300"
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  return (
    <label className="block min-w-0">
      {baseLabel}
      <input
        type={field.type === "time" ? "time" : "text"}
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="mt-2 h-11 w-full min-w-0 rounded-md border border-white/10 bg-white/[0.04] px-3 text-white outline-none transition focus:border-cyan-300"
        placeholder={field.placeholder}
      />
    </label>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  const labelByStatus: Record<SaveStatus, string> = {
    idle: "Sin cambios guardados aun",
    dirty: "Guardado automatico pendiente",
    saving: "Guardando...",
    saved: "Guardado",
    error: "Error al guardar",
  };

  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-200">
      {status === "saving" ? (
        <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
      ) : (
        <Check className={`h-4 w-4 ${status === "error" ? "text-red-300" : "text-emerald-300"}`} />
      )}
      {labelByStatus[status]}
    </div>
  );
}

function Timeline({ tasks }: { tasks: PublicTask[] }) {
  return (
    <section className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-zinc-950 text-fuchsia-200">
          <Clock className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Cronograma publico</h2>
          <p className="text-sm text-zinc-500">{tasks.length} momentos visibles</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {tasks.length === 0 ? (
          <p className="rounded-md border border-white/10 bg-zinc-950/60 p-4 text-sm leading-6 text-zinc-400">
            Cuando el cuestionario active momentos publicos, apareceran aqui para revisar el flujo del evento.
          </p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="relative border-l border-cyan-300/30 pl-4">
              <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-cyan-300" />
              <p className="text-sm font-semibold text-cyan-100">
                {task.scheduled_time?.slice(0, 5) || "Por definir"}
              </p>
              <h3 className="mt-1 font-semibold text-white">{task.task_name}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {task.description || "Momento contemplado para el evento."}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
