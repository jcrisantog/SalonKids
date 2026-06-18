import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-api";
import { loadStaffTaskHistory } from "@/lib/staff-task-history";
import { supabaseAdmin } from "@/lib/supabase-server";

function cleanParam(value: string | null) {
  return value?.trim() || null;
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const staffId = cleanParam(url.searchParams.get("staffId"));
  const eventId = cleanParam(url.searchParams.get("eventId"));
  const history = await loadStaffTaskHistory(supabaseAdmin, {
    eventId,
    staffId,
    limit: 5,
  });

  if (history.error) {
    return NextResponse.json({ error: "No se pudo cargar el historial del personal." }, { status: 500 });
  }

  return NextResponse.json({
    events: history.events,
    members: history.members,
    filters: {
      eventId,
      staffId,
    },
  });
}
