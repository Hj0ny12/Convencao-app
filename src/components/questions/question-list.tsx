export function QuestionList({
  firstName,
  questions,
}: {
  firstName: string;
  questions: {
    _id: string;
    text: string;
    status: "visible" | "answered";
    isMine: boolean;
  }[];
}) {
  if (questions.length === 0) {
    return (
      <div className="flex flex-col gap-2 pt-2">
        <p>Ainda ninguém fez uma pergunta ao {firstName}.</p>
        <p>Queres ser o primeiro?</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-4 pt-2">
      {questions.map((question) => (
        <li key={question._id} className="border-b border-border pb-4">
          {question.isMine ? (
            <p className="mb-1 text-xs font-semibold">A tua pergunta</p>
          ) : null}
          <p>{question.text}</p>
        </li>
      ))}
    </ol>
  );
}
