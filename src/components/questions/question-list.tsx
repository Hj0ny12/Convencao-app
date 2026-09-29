import type { Id } from "../../../convex/_generated/dataModel";
import { VoteButton } from "@/components/questions/vote-button";

export function QuestionList({
  firstName,
  speakerSlug,
  deviceId,
  votingEnabled,
  questions,
}: {
  firstName: string;
  speakerSlug: string;
  deviceId: string | null;
  votingEnabled: boolean;
  questions: {
    _id: Id<"questions">;
    text: string;
    status: "visible" | "answered";
    isMine: boolean;
    voteCount: number;
    votedByMe: boolean;
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
        <li key={question._id} className="flex flex-col gap-2 border-b border-border pb-4">
          <VoteButton
            questionId={question._id}
            voteCount={question.voteCount}
            votedByMe={question.votedByMe}
            speakerSlug={speakerSlug}
            deviceId={deviceId}
            disabled={!votingEnabled}
          />
          <p>{question.text}</p>
          {question.isMine ? (
            <p className="text-xs font-semibold">A tua pergunta</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
