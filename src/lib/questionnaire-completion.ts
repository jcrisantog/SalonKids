export type QuestionnaireCompletionStatus =
  | "sin_iniciar"
  | "en_progreso"
  | "completado_por_cliente";

export const questionnaireCompletionLabels: Record<QuestionnaireCompletionStatus, string> = {
  sin_iniciar: "Sin iniciar",
  en_progreso: "En progreso",
  completado_por_cliente: "Completado por cliente",
};

export function getQuestionnaireCompletionStatus(input: {
  hasQuestionnaire: boolean;
  completedAt?: string | null;
}): QuestionnaireCompletionStatus {
  if (!input.hasQuestionnaire) {
    return "sin_iniciar";
  }

  return input.completedAt ? "completado_por_cliente" : "en_progreso";
}

export function getQuestionnaireCompletionLabel(status: QuestionnaireCompletionStatus) {
  return questionnaireCompletionLabels[status];
}

type QuestionnaireCompletionRow = {
  id?: string | null;
  completed_at?: string | null;
};

export function getQuestionnaireCompletionFromRelation(
  relation: QuestionnaireCompletionRow | QuestionnaireCompletionRow[] | null | undefined,
) {
  const row = Array.isArray(relation) ? relation[0] : relation;
  const completedAt = row?.completed_at ?? null;

  return {
    questionnaire_completed_at: completedAt,
    questionnaire_status: getQuestionnaireCompletionStatus({
      hasQuestionnaire: Boolean(row),
      completedAt,
    }),
  };
}
