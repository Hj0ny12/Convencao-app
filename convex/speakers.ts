import { mutation, query } from "./_generated/server";

/**
 * Display copy, including agenda times, will live in `src/lib/speakers.ts`.
 * Slugs, names, roles, titles, and order below must stay aligned with that file.
 * `time` is not stored in Convex.
 */
const SPEAKERS = [
  {
    slug: "maria-corominas",
    name: "Maria Corominas",
    role: "CEO FI Group",
    title: "Título da intervenção",
    order: 0,
  },
  {
    slug: "paulo-reis",
    name: "Paulo Reis",
    role: "Diretor Geral, FI Group Portugal",
    title: "Título da intervenção",
    order: 1,
  },
  {
    slug: "samanta",
    name: "Samanta",
    role: "Intervenção sobre pessoas e colaboradores em Portugal",
    title: "Título da intervenção",
    order: 2,
  },
] as const;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("speakers").withIndex("by_order").collect();
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    for (const speaker of SPEAKERS) {
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
