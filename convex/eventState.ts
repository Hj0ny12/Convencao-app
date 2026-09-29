import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query("eventState").first();
    if (!row) {
      return { afterUnlocked: false, updatedAt: 0 };
    }
    return {
      afterUnlocked: row.afterUnlocked,
      updatedAt: row.updatedAt,
    };
  },
});

export const ensure = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("eventState").first();
    if (existing) return;
    await ctx.db.insert("eventState", {
      afterUnlocked: false,
      updatedAt: Date.now(),
    });
  },
});
