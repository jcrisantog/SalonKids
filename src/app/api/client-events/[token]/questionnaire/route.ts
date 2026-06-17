import { NextResponse } from "next/server";

import { getQuestionnaireCompletionStatus } from "@/lib/questionnaire-completion";
import { normalizeQuestionnaire } from "@/lib/questionnaire-schema";
import { syncReactiveTasks, type QuestionnaireData } from "@/lib/rule-engine";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    token: string;
  }>;
};

async function findEventByToken(token: string) {
  const { data, error } = await supabaseAdmin
    .from("events")
    .select("id, celebratory_name, age, event_date, start_time, end_time, status")
    .eq("token_unico", token)
    .single();

  if (error) {
    return { event: null, error };
  }

  return { event: data, error: null };
}

async function getPublicTasks(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from("event_tasks")
    .select("id, task_name, description, scheduled_time, role_responsible, visibility, status")
    .eq("event_id", eventId)
    .eq("visibility", "publica")
    .order("scheduled_time", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function GET(_request: Request, context: RouteParams) {
  const { token } = await context.params;
  const { event, error } = await findEventByToken(token);

  if (error || !event) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  const { data: questionnaire, error: questionnaireError } = await supabaseAdmin
    .from("questionnaire_data")
    .select("data, updated_at, completed_at")
    .eq("event_id", event.id)
    .maybeSingle();

  if (questionnaireError) {
    return NextResponse.json(
      { error: "No se pudo cargar el cuestionario." },
      { status: 500 },
    );
  }

  try {
    const publicTasks = await getPublicTasks(event.id);
    const completedAt = questionnaire?.completed_at ?? null;

    return NextResponse.json({
      event,
      questionnaire: normalizeQuestionnaire(
        (questionnaire?.data ?? {}) as Partial<QuestionnaireData>,
      ),
      updatedAt: questionnaire?.updated_at ?? null,
      completedAt,
      questionnaireStatus: getQuestionnaireCompletionStatus({
        hasQuestionnaire: Boolean(questionnaire),
        completedAt,
      }),
      publicTasks,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar el cronograma publico." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteParams) {
  const { token } = await context.params;
  const { event, error } = await findEventByToken(token);

  if (error || !event) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  const body = (await request.json()) as {
    intent?: "save" | "complete";
    questionnaire?: QuestionnaireData;
  };
  const intent = body.intent === "complete" ? "complete" : "save";
  const questionnaire = normalizeQuestionnaire(body.questionnaire ?? {});
  const savedAt = new Date().toISOString();
  const completedAt = intent === "complete" ? savedAt : null;

  const { error: upsertError } = await supabaseAdmin.from("questionnaire_data").upsert(
    {
      event_id: event.id,
      data: questionnaire,
      updated_at: savedAt,
      completed_at: completedAt,
    },
    { onConflict: "event_id" },
  );

  if (upsertError) {
    return NextResponse.json(
      {
        error:
          intent === "complete"
            ? "No se pudo enviar el cuestionario."
            : "No se pudo guardar el cuestionario.",
      },
      { status: 500 },
    );
  }

  try {
    const generatedTasks = await syncReactiveTasks(supabaseAdmin, event.id, questionnaire);

    if (event.status !== "validado" && event.status !== "finalizado") {
      await supabaseAdmin
        .from("events")
        .update({ status: "guardado" })
        .eq("id", event.id);
    }

    const publicTasks = await getPublicTasks(event.id);

    return NextResponse.json({
      ok: true,
      generatedTasks,
      publicTasks,
      completedAt,
      questionnaireStatus: getQuestionnaireCompletionStatus({
        hasQuestionnaire: true,
        completedAt,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "El cuestionario se guardó, pero falló la inyección de tareas." },
      { status: 500 },
    );
  }
}
