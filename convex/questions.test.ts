import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.modules";

const deviceA = "11111111-1111-4111-8111-111111111111";
const deviceB = "22222222-2222-4222-8222-222222222222";
const deviceC = "33333333-3333-4333-8333-333333333333";

function start() {
  return convexTest(schema, modules);
}

async function seed(t: ReturnType<typeof start>) {
  await t.mutation(api.speakers.seed, {});
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

async function ageQuestions(t: ReturnType<typeof start>) {
  await t.run(async (ctx) => {
    const rows = await ctx.db.query("questions").collect();
    for (const row of rows) {
      await ctx.db.patch(row._id, { createdAt: Date.now() - 10_000 });
    }
  });
}

describe("questions", () => {
  it("inserts when the speaker is OPEN and rejects a second insert for the same device", async () => {
    const t = start();
    await seed(t);
    const id = await t.mutation(api.questions.submit, {
      speakerSlug: "maria-corominas",
      text: "Como podemos usar IA?",
      deviceId: deviceA,
    });
    expect(id).toBeTruthy();
    await expectConvexError(
      () =>
        t.mutation(api.questions.submit, {
          speakerSlug: "maria-corominas",
          text: "Outra pergunta valida?",
          deviceId: deviceA,
        }),
      "question already submitted",
    );
  });

  it("accepts a different speaker for the same device", async () => {
    const t = start();
    await seed(t);
    await t.mutation(api.questions.submit, {
      speakerSlug: "maria-corominas",
      text: "Como podemos usar IA?",
      deviceId: deviceA,
    });
    await ageQuestions(t);
    const id = await t.mutation(api.questions.submit, {
      speakerSlug: "paulo-reis",
      text: "Qual é o próximo passo?",
      deviceId: deviceA,
    });
    expect(id).toBeTruthy();
  });

  it("rejects submit when the session is VOTING or FINISHED", async () => {
    const t = start();
    await seed(t);
    await t.run(async (ctx) => {
      const speaker = await ctx.db
        .query("speakers")
        .withIndex("by_slug", (q) => q.eq("slug", "maria-corominas"))
        .unique();
      if (!speaker) throw new Error("missing speaker");
      await ctx.db.patch(speaker._id, { sessionStatus: "VOTING" });
    });
    await expectConvexError(
      () =>
        t.mutation(api.questions.submit, {
          speakerSlug: "maria-corominas",
          text: "Como podemos usar IA?",
          deviceId: deviceA,
        }),
      "session is not open",
    );

    await t.run(async (ctx) => {
      const speaker = await ctx.db
        .query("speakers")
        .withIndex("by_slug", (q) => q.eq("slug", "paulo-reis"))
        .unique();
      if (!speaker) throw new Error("missing speaker");
      await ctx.db.patch(speaker._id, { sessionStatus: "FINISHED" });
    });
    await expectConvexError(
      () =>
        t.mutation(api.questions.submit, {
          speakerSlug: "paulo-reis",
          text: "Qual é o próximo passo?",
          deviceId: deviceA,
        }),
      "session is not open",
    );
  });

  it("omits hidden questions and deviceId, and sets isMine only for the matching device", async () => {
    const t = start();
    await seed(t);
    await t.mutation(api.questions.submit, {
      speakerSlug: "maria-corominas",
      text: "Pergunta visível agora",
      deviceId: deviceA,
    });
    await ageQuestions(t);
    const hiddenId = await t.mutation(api.questions.submit, {
      speakerSlug: "maria-corominas",
      text: "Pergunta escondida agora",
      deviceId: deviceB,
    });
    await ageQuestions(t);
    await t.mutation(api.questions.submit, {
      speakerSlug: "maria-corominas",
      text: "Pergunta respondida agora",
      deviceId: deviceC,
    });
    await t.run(async (ctx) => {
      const hidden = await ctx.db.get(hiddenId);
      if (!hidden) throw new Error("missing hidden question");
      await ctx.db.patch(hiddenId, { status: "hidden" });
      const answered = await ctx.db
        .query("questions")
        .withIndex("by_speaker_device", (q) =>
          q.eq("speakerId", hidden.speakerId).eq("deviceId", deviceC),
        )
        .unique();
      if (!answered) throw new Error("missing answered question");
      await ctx.db.patch(answered._id, { status: "answered" });
    });

    const listed = await t.query(api.questions.listBySpeaker, {
      speakerSlug: "maria-corominas",
      deviceId: deviceA,
    });
    expect(listed.map((row) => row.text).sort()).toEqual([
      "Pergunta respondida agora",
      "Pergunta visível agora",
    ]);
    expect(JSON.stringify(listed)).not.toContain("deviceId");
    expect(JSON.stringify(listed)).not.toContain(deviceA);
    expect(JSON.stringify(listed)).not.toContain(deviceB);
    expect(listed.find((row) => row.text === "Pergunta visível agora")?.isMine).toBe(
      true,
    );
    expect(
      listed.find((row) => row.text === "Pergunta respondida agora")?.isMine,
    ).toBe(false);
  });
});
