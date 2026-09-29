import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.modules";

const deviceA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const deviceB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function start() {
  return convexTest(schema, modules);
}

async function expectConvexError(run: () => Promise<unknown>, data: string) {
  try {
    await run();
  } catch (error) {
    expect(error).toBeInstanceOf(ConvexError);
    expect((error as ConvexError<string>).data).toBe(data);
    return;
  }
  throw new Error(`expected ConvexError ${data}`);
}

async function openQuestion(t: ReturnType<typeof start>, deviceId: string) {
  await t.mutation(api.speakers.seed, {});
  return await t.mutation(api.questions.submit, {
    speakerSlug: "maria-corominas",
    text: "Como podemos usar IA?",
    deviceId,
  });
}

describe("votes", () => {
  it("casts once and does not duplicate a second cast", async () => {
    const t = start();
    const questionId = await openQuestion(t, deviceA);
    const first = await t.mutation(api.votes.cast, {
      questionId,
      deviceId: deviceB,
    });
    const second = await t.mutation(api.votes.cast, {
      questionId,
      deviceId: deviceB,
    });
    expect(second).toBe(first);
    const count = await t.run(async (ctx) => {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_question", (q) => q.eq("questionId", questionId))
        .collect();
      return votes.length;
    });
    expect(count).toBe(1);
  });

  it("removes the vote", async () => {
    const t = start();
    const questionId = await openQuestion(t, deviceA);
    await t.mutation(api.votes.cast, { questionId, deviceId: deviceB });
    await t.mutation(api.votes.remove, { questionId, deviceId: deviceB });
    const count = await t.run(async (ctx) => {
      const votes = await ctx.db
        .query("votes")
        .withIndex("by_question", (q) => q.eq("questionId", questionId))
        .collect();
      return votes.length;
    });
    expect(count).toBe(0);
  });

  it("rejects a hidden question", async () => {
    const t = start();
    const questionId = await openQuestion(t, deviceA);
    await t.run(async (ctx) => {
      await ctx.db.patch(questionId, { status: "hidden" });
    });
    await expectConvexError(
      () => t.mutation(api.votes.cast, { questionId, deviceId: deviceB }),
      "question is not votable",
    );
  });

  it("rejects cast when the session is FINISHED", async () => {
    const t = start();
    const questionId = await openQuestion(t, deviceA);
    await t.run(async (ctx) => {
      const speaker = await ctx.db.get(
        (await ctx.db.get(questionId))!.speakerId,
      );
      if (!speaker) throw new Error("missing speaker");
      await ctx.db.patch(speaker._id, { sessionStatus: "FINISHED" });
    });
    await expectConvexError(
      () => t.mutation(api.votes.cast, { questionId, deviceId: deviceB }),
      "voting is closed",
    );
  });

  it("accepts cast when the session is VOTING", async () => {
    const t = start();
    const questionId = await openQuestion(t, deviceA);
    await t.run(async (ctx) => {
      const speaker = await ctx.db.get(
        (await ctx.db.get(questionId))!.speakerId,
      );
      if (!speaker) throw new Error("missing speaker");
      await ctx.db.patch(speaker._id, { sessionStatus: "VOTING" });
    });
    const voteId = await t.mutation(api.votes.cast, {
      questionId,
      deviceId: deviceB,
    });
    expect(voteId).toBeTruthy();
  });
});
