import { ConvexError, v } from "convex/values";
import { isUuid } from "../src/lib/text";
import { SUBMIT_GAP_MS } from "./constants";
import { mutation } from "./_generated/server";

export const cast = mutation({
  args: {
    questionId: v.id("questions"),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isUuid(args.deviceId)) throw new ConvexError("invalid device");
    const question = await ctx.db.get(args.questionId);
    if (!question || question.status === "hidden") {
      throw new ConvexError("question is not votable");
    }
    const speaker = await ctx.db.get(question.speakerId);
    if (!speaker || speaker.sessionStatus === "FINISHED") {
      throw new ConvexError("voting is closed");
    }
    if (speaker.sessionStatus !== "OPEN" && speaker.sessionStatus !== "VOTING") {
      throw new ConvexError("voting is closed");
    }

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_question_device", (q) =>
        q.eq("questionId", args.questionId).eq("deviceId", args.deviceId),
      )
      .unique();
    if (existing) return existing._id;

    const ownVotes = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("deviceId"), args.deviceId))
      .collect();
    const newest = ownVotes.reduce(
      (latest, vote) => Math.max(latest, vote.createdAt),
      0,
    );
    if (newest > 0 && Date.now() - newest < SUBMIT_GAP_MS) {
      throw new ConvexError("slow down");
    }

    return await ctx.db.insert("votes", {
      questionId: args.questionId,
      deviceId: args.deviceId,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    questionId: v.id("questions"),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isUuid(args.deviceId)) throw new ConvexError("invalid device");
    const question = await ctx.db.get(args.questionId);
    if (!question || question.status === "hidden") {
      throw new ConvexError("question is not votable");
    }
    const speaker = await ctx.db.get(question.speakerId);
    if (
      !speaker ||
      (speaker.sessionStatus !== "OPEN" && speaker.sessionStatus !== "VOTING")
    ) {
      throw new ConvexError("voting is closed");
    }

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_question_device", (q) =>
        q.eq("questionId", args.questionId).eq("deviceId", args.deviceId),
      )
      .unique();
    if (!existing) return null;
    await ctx.db.delete(existing._id);
    return null;
  },
});
