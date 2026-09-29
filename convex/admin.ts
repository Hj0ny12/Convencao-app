import { ConvexError, v } from "convex/values";
import { verifySession } from "../src/lib/admin-session";
import { mutation, query } from "./_generated/server";

export async function assertSession(sessionToken: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !(await verifySession(sessionToken, secret))) {
    throw new ConvexError("unauthorized");
  }
}

const questionStatus = v.union(
  v.literal("visible"),
  v.literal("hidden"),
  v.literal("answered"),
);
const sessionStatus = v.union(
  v.literal("OPEN"),
  v.literal("VOTING"),
  v.literal("FINISHED"),
);

export const summary = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await assertSession(args.sessionToken);
    const speakers = await ctx.db.query("speakers").withIndex("by_order").collect();
    const rows = [];
    for (const speaker of speakers) {
      const questions = await ctx.db
        .query("questions")
        .withIndex("by_speaker", (q) => q.eq("speakerId", speaker._id))
        .collect();
      let voteCount = 0;
      for (const question of questions) {
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_question", (q) => q.eq("questionId", question._id))
          .collect();
        voteCount += votes.length;
      }
      rows.push({
        slug: speaker.slug,
        name: speaker.name,
        order: speaker.order,
        sessionStatus: speaker.sessionStatus,
        questionCount: questions.length,
        voteCount,
      });
    }
    return rows;
  },
});

export const moderation = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await assertSession(args.sessionToken);
    const speakers = await ctx.db.query("speakers").withIndex("by_order").collect();
    const groups = [];
    for (const speaker of speakers) {
      const questions = await ctx.db
        .query("questions")
        .withIndex("by_speaker", (q) => q.eq("speakerId", speaker._id))
        .collect();
      const items = [];
      for (const question of questions) {
        const votes = await ctx.db
          .query("votes")
          .withIndex("by_question", (q) => q.eq("questionId", question._id))
          .collect();
        items.push({
          _id: question._id,
          text: question.text,
          status: question.status,
          voteCount: votes.length,
          createdAt: question.createdAt,
        });
      }
      items.sort((a, b) => b.voteCount - a.voteCount || a.createdAt - b.createdAt);
      groups.push({
        slug: speaker.slug,
        name: speaker.name,
        sessionStatus: speaker.sessionStatus,
        questions: items,
      });
    }
    return groups;
  },
});

export const liveQuestions = query({
  args: {
    sessionToken: v.string(),
    speakerSlug: v.string(),
  },
  handler: async (ctx, args) => {
    await assertSession(args.sessionToken);
    const speaker = await ctx.db
      .query("speakers")
      .withIndex("by_slug", (q) => q.eq("slug", args.speakerSlug))
      .unique();
    if (!speaker) return null;
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_speaker", (q) => q.eq("speakerId", speaker._id))
      .collect();
    const visible = [];
    for (const question of questions) {
      if (question.status === "hidden") continue;
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_question", (q) => q.eq("questionId", question._id))
        .collect();
      visible.push({
        text: question.text,
        status: question.status,
        voteCount: votes.length,
        createdAt: question.createdAt,
      });
    }
    visible.sort(
      (a, b) => b.voteCount - a.voteCount || a.createdAt - b.createdAt,
    );
    return {
      name: speaker.name,
      sessionStatus: speaker.sessionStatus,
      questions: visible.slice(0, 10).map((question, index) => ({
        rank: index + 1,
        text: question.text,
        voteCount: question.voteCount,
        status: question.status,
      })),
    };
  },
});

export const setQuestionStatus = mutation({
  args: {
    sessionToken: v.string(),
    questionId: v.id("questions"),
    status: questionStatus,
  },
  handler: async (ctx, args) => {
    await assertSession(args.sessionToken);
    const question = await ctx.db.get(args.questionId);
    if (!question) throw new ConvexError("missing question");
    await ctx.db.patch(args.questionId, { status: args.status });
  },
});

export const setSessionStatus = mutation({
  args: {
    sessionToken: v.string(),
    speakerSlug: v.string(),
    sessionStatus,
  },
  handler: async (ctx, args) => {
    await assertSession(args.sessionToken);
    const speaker = await ctx.db
      .query("speakers")
      .withIndex("by_slug", (q) => q.eq("slug", args.speakerSlug))
      .unique();
    if (!speaker) throw new ConvexError("unknown speaker");
    await ctx.db.patch(speaker._id, { sessionStatus: args.sessionStatus });
  },
});
