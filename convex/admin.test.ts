import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { beforeAll, describe, expect, it } from "vitest";
import { signSession } from "../src/lib/admin-session";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.modules";

const secret = "test-session-secret";
const deviceA = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";

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

beforeAll(() => {
  process.env.SESSION_SECRET = secret;
});

describe("admin mutations", () => {
  it("rejects moderation without a valid token and accepts a signed token", async () => {
    const t = start();
    await t.mutation(api.speakers.seed, {});
    const questionId = await t.mutation(api.questions.submit, {
      speakerSlug: "maria-corominas",
      text: "Como podemos usar IA?",
      deviceId: deviceA,
    });

    await expectConvexError(
      () =>
        t.mutation(api.admin.setQuestionStatus, {
          sessionToken: "not-a-token",
          questionId,
          status: "hidden",
        }),
      "unauthorized",
    );
    await expectConvexError(
      () =>
        t.mutation(api.admin.setSessionStatus, {
          sessionToken: "not-a-token",
          speakerSlug: "maria-corominas",
          sessionStatus: "VOTING",
        }),
      "unauthorized",
    );
    await expectConvexError(
      () =>
        t.mutation(api.admin.setAfterUnlocked, {
          sessionToken: "not-a-token",
          afterUnlocked: true,
        }),
      "unauthorized",
    );

    const sessionToken = await signSession(secret);
    await t.mutation(api.admin.setQuestionStatus, {
      sessionToken,
      questionId,
      status: "hidden",
    });
    await t.mutation(api.admin.setSessionStatus, {
      sessionToken,
      speakerSlug: "maria-corominas",
      sessionStatus: "VOTING",
    });
    await t.mutation(api.admin.setAfterUnlocked, {
      sessionToken,
      afterUnlocked: true,
    });

    const question = await t.run(async (ctx) => ctx.db.get(questionId));
    const speaker = await t.run(async (ctx) => {
      return await ctx.db
        .query("speakers")
        .withIndex("by_slug", (q) => q.eq("slug", "maria-corominas"))
        .unique();
    });
    const eventState = await t.query(api.eventState.get, {});
    expect(question?.status).toBe("hidden");
    expect(speaker?.sessionStatus).toBe("VOTING");
    expect(eventState).toEqual({ afterUnlocked: true });
  });
});
