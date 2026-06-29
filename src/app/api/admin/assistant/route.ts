import { NextResponse } from "next/server";

import { answerAdminAssistantQuestion } from "@/lib/admin-assistant-guide";
import { requireAdmin } from "@/lib/admin-api";

type AssistantRequestBody = {
  message?: unknown;
  currentPath?: unknown;
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  let body: AssistantRequestBody;

  try {
    body = (await request.json()) as AssistantRequestBody;
  } catch {
    return NextResponse.json({ error: "Consulta invalida." }, { status: 400 });
  }

  if (typeof body.message !== "string" || body.message.trim().length === 0) {
    return NextResponse.json({ error: "Escribe una pregunta para el asistente." }, { status: 400 });
  }

  const currentPath = typeof body.currentPath === "string" ? body.currentPath : "/admin/dashboard";
  const response = answerAdminAssistantQuestion(body.message, currentPath);

  return NextResponse.json(response);
}
