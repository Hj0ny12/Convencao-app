import { QUESTION_MAX, QUESTION_MIN, WORD_MAX } from "./limits";

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function normalizeQuestionText(input: string) {
  const text = input.replace(/[<>]/g, "").trim();
  if (text.length < QUESTION_MIN || text.length > QUESTION_MAX) {
    throw new Error("invalid question length");
  }
  return text;
}

function stripEdgePunctuation(value: string) {
  let current = value.trim();
  const edge = /^[.,!?;:"'«»()[\]]+|[.,!?;:"'«»()[\]]+$/;
  for (;;) {
    const next = current.replace(edge, "").trim();
    if (next === current) return current;
    current = next;
  }
}

export function normalizeWord(input: string) {
  const displayWord = stripEdgePunctuation(input);
  if (
    !displayWord ||
    /\s/.test(displayWord) ||
    displayWord.length > WORD_MAX
  ) {
    throw new Error("invalid word");
  }
  return {
    displayWord,
    normalizedWord: displayWord.toLocaleLowerCase("pt-PT"),
  };
}
