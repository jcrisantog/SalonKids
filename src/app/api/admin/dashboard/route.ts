import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const today = new Date().toISOString().slice(0, 10);

  const [eventsResult, upcomingEventsWithQuestionnaireResult, activeStaffResult] =
    await Promise.all([
      supabaseAdmin
        .from("events")
        .select("id", { count: "exact", head: true })
        .gte("event_date", today),
      supabaseAdmin
        .from("events")
        .select("id, questionnaire_data(completed_at)")
        .gte("event_date", today),
      supabaseAdmin
        .from("staff")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  const firstError =
    eventsResult.error ||
    upcomingEventsWithQuestionnaireResult.error ||
    activeStaffResult.error;

  if (firstError) {
    return NextResponse.json(
      { error: "No se pudo cargar el resumen administrativo." },
      { status: 500 },
    );
  }

  const upcomingEventsWithQuestionnaire = upcomingEventsWithQuestionnaireResult.data ?? [];
  const completedQuestionnaires = upcomingEventsWithQuestionnaire.filter((event) => {
    const questionnaireData = Array.isArray(event.questionnaire_data)
      ? event.questionnaire_data[0]
      : event.questionnaire_data;

    return Boolean(questionnaireData?.completed_at);
  }).length;

  return NextResponse.json({
    upcomingEvents: eventsResult.count ?? 0,
    activeStaff: activeStaffResult.count ?? 0,
    pendingQuestionnaires: Math.max(
      0,
      upcomingEventsWithQuestionnaire.length - completedQuestionnaires,
    ),
    completedQuestionnaires,
  });
}
