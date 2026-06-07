import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { sendQuestionnaireWhatsApp } from "@/lib/notifications";
import { supabaseAdmin } from "@/lib/supabase-server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteParams) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const { id } = await context.params;
  const origin = new URL(request.url).origin;

  const { data: event, error } = await supabaseAdmin
    .from("events")
    .select(
      "celebratory_name, event_date, start_time, token_unico, clients(full_name, phone, email)",
    )
    .eq("id", id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  try {
    const normalizedEvent = {
      ...event,
      clients: Array.isArray(event.clients) ? event.clients[0] ?? null : event.clients,
    };
    const result = await sendQuestionnaireWhatsApp(normalizedEvent, origin);

    return NextResponse.json(result);
  } catch (notifyError) {
    return NextResponse.json(
      {
        error:
          notifyError instanceof Error
            ? notifyError.message
            : "No se pudo preparar la notificacion.",
      },
      { status: 400 },
    );
  }
}
