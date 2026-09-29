import { speakers } from "../src/lib/speakers";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("speakers").withIndex("by_order").collect();
    return rows.map((row) => ({
      _id: row._id,
      slug: row.slug,
      name: row.name,
      role: row.role,
      title: row.title,
      order: row.order,
      sessionStatus: row.sessionStatus,
    }));
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    for (const speaker of speakers) {
      const existing = await ctx.db
        .query("speakers")
        .withIndex("by_slug", (q) => q.eq("slug", speaker.slug))
        .unique();
      if (existing) continue;
      await ctx.db.insert("speakers", {
        slug: speaker.slug,
        name: speaker.name,
        role: speaker.role,
        title: speaker.title,
        order: speaker.order,
        sessionStatus: "OPEN",
      });
    }
  },
});
