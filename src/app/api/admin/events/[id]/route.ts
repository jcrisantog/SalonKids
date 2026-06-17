import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { getQuestionnaireCompletionFromRelation } from "@/lib/questionnaire-completion";
import { syncBaseEventTasks } from "@/lib/rule-engine";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type EventPayload = {
  client_full_name?: string;
  client_phone?: string;
  client_email?: string;
  celebratory_name?: string;
  age?: number | null;
  parents_names?: string;
  event_date?: string;
  start_time?: string;
  end_time?: string;
  status?: "pendiente" | "guardado" | "validado" | "finalizado";
};

function cleanText(value?: string) {
  return value?.trim() || null;
}

function normalizeTime(value?: string) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

function withQuestionnaireCompletion<T extends { questionnaire_data?: unknown }>(event: T) {
  const { questionnaire_data: questionnaireData, ...rest } = event;

  return {
    ...rest,
    ...getQuestionnaireCompletionFromRelation(
      questionnaireData as Parameters<typeof getQuestionnaireCompletionFromRelation>[0],
    ),
  };
}

async function saveClient(eventId: string, payload: EventPayload) {
  const fullName = cleanText(payload.client_full_name);

  if (!fullName) {
    return null;
  }

  const { data: currentEvent, error: currentEventError } = await supabaseAdmin
    .from("events")
    .select("client_id")
    .eq("id", eventId)
    .single();

  if (currentEventError) {
    throw currentEventError;
  }

  if (currentEvent.client_id) {
    const { error } = await supabaseAdmin
      .from("clients")
      .update({
        full_name: fullName,
        phone: cleanText(payload.client_phone),
        email: cleanText(payload.client_email),
      })
      .eq("id", currentEvent.client_id);

    if (error) {
      throw error;
    }

    return currentEvent.client_id as string;
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .insert({
      full_name: fullName,
      phone: cleanText(payload.client_phone),
      email: cleanText(payload.client_email),
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data.id as string;
}

export async function PATCH(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const payload = (await request.json()) as EventPayload;
  const celebratoryName = cleanText(payload.celebratory_name);
  const eventDate = cleanText(payload.event_date);
  const startTime = normalizeTime(payload.start_time);
  const endTime = normalizeTime(payload.end_time);

  if (!celebratoryName || !eventDate || !startTime || !endTime) {
    return NextResponse.json(
      { error: "Festejado, fecha, hora de inicio y hora de fin son obligatorios." },
      { status: 400 },
    );
  }

  try {
    const clientId = await saveClient(id, payload);

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .update({
        client_id: clientId,
        celebratory_name: celebratoryName,
        age: payload.age || null,
        parents_names: cleanText(payload.parents_names),
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        status: payload.status ?? "pendiente",
      })
      .eq("id", id)
      .select(
        "id, client_id, celebratory_name, age, parents_names, event_date, start_time, end_time, token_unico, status, created_at, clients(full_name, phone, email), questionnaire_data(id, completed_at)",
      )
      .single();

    if (error) {
      throw error;
    }

    const generatedTasks = await syncBaseEventTasks(supabaseAdmin, id, {
      start_time: startTime,
      end_time: endTime,
    });

    return NextResponse.json({ event: withQuestionnaireCompletion(event), generatedTasks });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar el evento." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const { error } = await supabaseAdmin.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el evento." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
