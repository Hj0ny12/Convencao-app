export function SpeakerSummary({
  name,
  questionCount,
  voteCount,
}: {
  name: string;
  questionCount: number;
  voteCount: number;
}) {
  return (
    <section className="border-b border-border py-4">
      <h2 className="text-lg font-semibold">{name}</h2>
      <p>
        {questionCount} {questionCount === 1 ? "pergunta" : "perguntas"}
      </p>
      <p>
        {voteCount} {voteCount === 1 ? "voto" : "votos"}
      </p>
    </section>
  );
}
