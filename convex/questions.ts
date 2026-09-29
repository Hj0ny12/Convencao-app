import { ConvexError, v } from "convex/values";
import { isUuid, normalizeQuestionText } from "../src/lib/text";
import { SUBMIT_GAP_MS } from "./constants";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    speakerSlug: v.string(),
    text: v.string(),
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isUuid(args.deviceId)) {
      throw new ConvexError("invalid device");
    }

    const speaker = await ctx.db
      .query("speakers")
      .withIndex("by_slug", (q) => q.eq("slug", args.speakerSlug))
      .unique();
    if (!speaker) {
      throw new ConvexError("unknown speaker");
    }
    if (speaker.sessionStatus !== "OPEN") {
      throw new ConvexError("session is not open");
    }

    let text: string;
    try {
      text = normalizeQuestionText(args.text);
    } catch {
      throw new ConvexError("invalid question");
    }

    const existing = await ctx.db
      .query("questions")
      .withIndex("by_speaker_device", (q) =>
        q.eq("speakerId", speaker._id).eq("deviceId", args.deviceId),
      )
      .unique();
    if (existing) {
      throw new ConvexError("question already submitted");
    }

    const speakers = await ctx.db.query("speakers").collect();
    let newest = 0;
    for (const row of speakers) {
      const question = await ctx.db
        .query("questions")
        .withIndex("by_speaker_device", (q) =>
          q.eq("speakerId", row._id).eq("deviceId", args.deviceId),
        )
        .unique();
      if (question && question.createdAt > newest) newest = question.createdAt;
    }
    if (newest > 0 && Date.now() - newest < SUBMIT_GAP_MS) {
      throw new ConvexError("slow down");
    }

    return await ctx.db.insert("questions", {
      speakerId: speaker._id,
      text,
      deviceId: args.deviceId,
      status: "visible",
      createdAt: Date.now(),
    });
  },
});

export const listBySpeaker = query({
  args: {
    speakerSlug: v.string(),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const speaker = await ctx.db
      .query("speakers")
      .withIndex("by_slug", (q) => q.eq("slug", args.speakerSlug))
      .unique();
    if (!speaker) return [];

    const rows = await ctx.db
      .query("questions")
      .withIndex("by_speaker", (q) => q.eq("speakerId", speaker._id))
      .collect();

    return rows
      .filter(
        (
          row,
        ): row is typeof row & { status: "visible" | "answered" } =>
          row.status === "visible" || row.status === "answered",
      )
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((row) => ({
        _id: row._id,
        text: row.text,
        status: row.status,
        createdAt: row.createdAt,
        isMine: Boolean(args.deviceId) && row.deviceId === args.deviceId,
      }));
  },
});
