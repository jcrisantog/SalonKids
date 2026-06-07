import QuestionnaireClient from "./QuestionnaireClient";

type EventQuestionnairePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function EventQuestionnairePage({
  params,
}: EventQuestionnairePageProps) {
  const { token } = await params;

  return <QuestionnaireClient token={token} />;
}
