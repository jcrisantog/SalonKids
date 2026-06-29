import { NextResponse } from "next/server";

import { buildAssistantActionPlan } from "@/lib/admin-assistant-actions";
import { requireAdmin } from "@/lib/admin-api";

type PlanRequestBody = {
  message?: unknown;
  currentPath?: unknown;
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  let body: PlanRequestBody;

  try {
    body = (await request.json()) as PlanRequestBody;
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return NextResponse.json({ error: "Escribe una instruccion para el asistente." }, { status: 400 });
  }

  const currentPath = typeof body.currentPath === "string" ? body.currentPath : "/admin/dashboard";
  const response = await buildAssistantActionPlan({
    currentPath,
    message: body.message,
  });

  return NextResponse.json(response);
}
