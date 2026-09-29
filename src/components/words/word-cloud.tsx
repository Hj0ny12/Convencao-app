export function WordCloud({
  words,
}: {
  words: { displayWord: string; count: number }[];
}) {
  if (words.length === 0) {
    return <p>As palavras começam a aparecer assim que o público participa.</p>;
  }

  const counts = words.map((word) => word.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  return (
    <div className="flex min-h-[50vh] flex-wrap items-center justify-center gap-x-6 gap-y-4">
      {words.map((word) => {
        const scale = max === min ? 0.5 : (word.count - min) / (max - min);
        const size = 1.25 + scale * 3.25;
        return (
          <span
            key={word.displayWord}
            aria-label={word.displayWord}
            className="uppercase leading-none"
            style={{ fontSize: `${size}rem` }}
          >
            {word.displayWord}
          </span>
        );
      })}
    </div>
  );
}
