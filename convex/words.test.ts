import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.modules";

const deviceA = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const deviceB = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

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

describe("words", () => {
  it("stores display and normalized forms and rejects a second insert", async () => {
    const t = start();
    await t.mutation(api.words.submit, {
      raw: "  Inovação ",
      deviceId: deviceA,
    });
    const stored = await t.run(async (ctx) => {
      const row = await ctx.db.query("words").first();
      return row
        ? {
            displayWord: row.displayWord,
            normalizedWord: row.normalizedWord,
          }
        : null;
    });
    expect(stored).toEqual({
      displayWord: "Inovação",
      normalizedWord: "inovação",
    });
    await expectConvexError(
      () =>
        t.mutation(api.words.submit, {
          raw: "Outra",
          deviceId: deviceA,
        }),
      "word already submitted",
    );
  });

  it("counts Inovação and inovação together and keeps the earlier spelling", async () => {
    const t = start();
    await t.mutation(api.words.submit, {
      raw: "Inovação",
      deviceId: deviceA,
    });
    await t.mutation(api.words.submit, {
      raw: "inovação",
      deviceId: deviceB,
    });
    const cloud = await t.query(api.words.cloud, {});
    expect(cloud).toEqual([{ displayWord: "Inovação", count: 2 }]);
    expect(JSON.stringify(cloud)).not.toContain(deviceA);
    expect(JSON.stringify(cloud)).not.toContain("deviceId");
  });
});
