import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { syncBaseEventTasks } from "@/lib/rule-engine";
import { supabaseAdmin } from "@/lib/supabase-server";

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

async function upsertClient(payload: EventPayload) {
  const fullName = cleanText(payload.client_full_name);

  if (!fullName) {
    return null;
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

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { data, error } = await supabaseAdmin
    .from("events")
    .select(
      "id, client_id, celebratory_name, age, parents_names, event_date, start_time, end_time, token_unico, status, created_at, clients(full_name, phone, email)",
    )
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar los eventos." }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

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
    const clientId = await upsertClient(payload);

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .insert({
        client_id: clientId,
        celebratory_name: celebratoryName,
        age: payload.age || null,
        parents_names: cleanText(payload.parents_names),
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        status: payload.status ?? "pendiente",
      })
      .select(
        "id, client_id, celebratory_name, age, parents_names, event_date, start_time, end_time, token_unico, status, created_at, clients(full_name, phone, email)",
      )
      .single();

    if (error) {
      throw error;
    }

    const generatedTasks = await syncBaseEventTasks(supabaseAdmin, event.id, {
      start_time: startTime,
      end_time: endTime,
    });

    return NextResponse.json({ event, generatedTasks }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el evento." }, { status: 500 });
  }
}
