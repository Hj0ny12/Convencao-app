import { ConvexError, v } from "convex/values";
import { isUuid, normalizeWord } from "../src/lib/text";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    raw: v.string(),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isUuid(args.deviceId)) throw new ConvexError("invalid device");
    const existing = await ctx.db
      .query("words")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .unique();
    if (existing) throw new ConvexError("word already submitted");

    let word: { displayWord: string; normalizedWord: string };
    try {
      word = normalizeWord(args.raw);
    } catch {
      throw new ConvexError("invalid word");
    }

    return await ctx.db.insert("words", {
      displayWord: word.displayWord,
      normalizedWord: word.normalizedWord,
      deviceId: args.deviceId,
      createdAt: Date.now(),
    });
  },
});

export const cloud = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("words").collect();
    const groups = new Map<
      string,
      { displayWord: string; count: number; createdAt: number }
    >();
    for (const row of rows) {
      const current = groups.get(row.normalizedWord);
      if (!current) {
        groups.set(row.normalizedWord, {
          displayWord: row.displayWord,
          count: 1,
          createdAt: row.createdAt,
        });
        continue;
      }
      current.count += 1;
      if (row.createdAt < current.createdAt) {
        current.displayWord = row.displayWord;
        current.createdAt = row.createdAt;
      }
    }
    return [...groups.values()]
      .map(({ displayWord, count }) => ({ displayWord, count }))
      .sort(
        (a, b) =>
          b.count - a.count || a.displayWord.localeCompare(b.displayWord, "pt"),
      );
  },
});

export const mine = query({
  args: { deviceId: v.string() },
  handler: async (ctx, args) => {
    if (!isUuid(args.deviceId)) return null;
    const existing = await ctx.db
      .query("words")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .unique();
    if (!existing) return null;
    return { displayWord: existing.displayWord };
  },
});
