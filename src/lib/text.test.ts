import { describe, expect, it } from "vitest";
import { normalizeQuestionText, normalizeWord } from "./text";

describe("normalizeQuestionText", () => {
  it("trims and accepts 3 to 280 characters", () => {
    expect(normalizeQuestionText("  abc  ")).toBe("abc");
    expect(normalizeQuestionText("a".repeat(280))).toBe("a".repeat(280));
  });

  it("rejects 2 characters and 281", () => {
    expect(() => normalizeQuestionText("ab")).toThrow(/invalid question length/);
    expect(() => normalizeQuestionText("a".repeat(281))).toThrow(
      /invalid question length/,
    );
  });

  it("strips angle brackets", () => {
    expect(normalizeQuestionText("  <abc>  ")).toBe("abc");
  });
});

describe("normalizeWord", () => {
  it("keeps the four display and normalized forms from the plan", () => {
    expect(normalizeWord("  Inovação ")).toEqual({
      displayWord: "Inovação",
      normalizedWord: "inovação",
    });
    expect(normalizeWord("INOVAÇÃO")).toEqual({
      displayWord: "INOVAÇÃO",
      normalizedWord: "inovação",
    });
    expect(normalizeWord("inovação")).toEqual({
      displayWord: "inovação",
      normalizedWord: "inovação",
    });
    expect(normalizeWord("inovacao")).toEqual({
      displayWord: "inovacao",
      normalizedWord: "inovacao",
    });
  });

  it("rejects more than one word, empty input, and 31 characters", () => {
    expect(() => normalizeWord("FI Group")).toThrow(/invalid word/);
    expect(() => normalizeWord("")).toThrow(/invalid word/);
    expect(() => normalizeWord("a".repeat(31))).toThrow(/invalid word/);
  });

  it("does not strip the accent from inovação", () => {
    expect(normalizeWord("inovação").normalizedWord).toBe("inovação");
    expect(normalizeWord("inovação").normalizedWord).not.toBe("inovacao");
  });
});
