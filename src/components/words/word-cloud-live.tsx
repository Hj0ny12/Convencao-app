"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { WordCloud } from "@/components/words/word-cloud";

export function WordCloudLive({ showTotal = false }: { showTotal?: boolean }) {
  const words = useQuery(api.words.cloud);
  if (words === undefined) return <p>A carregar…</p>;
  const total = words.reduce((sum, word) => sum + word.count, 0);

  return (
    <div className="flex flex-col gap-4">
      {showTotal ? (
        <p className="text-sm">{total} palavras</p>
      ) : null}
      <WordCloud words={words} />
    </div>
  );
}
