import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const today = new Date().toISOString().slice(0, 10);

  const [eventsResult, activeStaffResult, masterTasksResult, pendingTasksResult] =
    await Promise.all([
      supabaseAdmin
        .from("events")
        .select("id", { count: "exact", head: true })
        .gte("event_date", today),
      supabaseAdmin
        .from("staff")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabaseAdmin.from("master_tasks").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("event_tasks")
        .select("id", { count: "exact", head: true })
        .eq("status", "pendiente"),
    ]);

  const firstError =
    eventsResult.error ||
    activeStaffResult.error ||
    masterTasksResult.error ||
    pendingTasksResult.error;

  if (firstError) {
    return NextResponse.json(
      { error: "No se pudo cargar el resumen administrativo." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    upcomingEvents: eventsResult.count ?? 0,
    activeStaff: activeStaffResult.count ?? 0,
    masterTasks: masterTasksResult.count ?? 0,
    pendingTasks: pendingTasksResult.count ?? 0,
  });
}
