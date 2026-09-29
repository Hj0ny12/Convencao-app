import { QUESTION_MAX, QUESTION_MIN } from "./limits";

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
