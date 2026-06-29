import { NextResponse } from "next/server";

import { executeAssistantActionPlan } from "@/lib/admin-assistant-actions";
import { requireAdmin } from "@/lib/admin-api";

type ExecuteRequestBody = {
  planToken?: unknown;
  confirmation?: unknown;
};

export async function POST(request: Request) {
  const auth = await requireAdmin(request);

  if (auth.response) {
    return auth.response;
  }

  let body: ExecuteRequestBody;

  try {
    body = (await request.json()) as ExecuteRequestBody;
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  if (typeof body.planToken !== "string" || body.planToken.length === 0) {
    return NextResponse.json({ error: "Plan invalido." }, { status: 400 });
  }

  const response = await executeAssistantActionPlan({
    confirmation: typeof body.confirmation === "string" ? body.confirmation : undefined,
    planToken: body.planToken,
    userId: auth.user.id,
  });

  const status = response.kind === "executed" ? 200 : 400;

  return NextResponse.json(response, { status });
}
