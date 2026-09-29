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
