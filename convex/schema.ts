import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database definition for FI Group Convention Live.
 * This file is the schema. Convex has no SQL migration directory.
 * It is applied to a deployment only when `npx convex dev` or
 * `npx convex deploy` runs against a linked project. Nothing here
 * connects to Convex cloud by itself.
 */
export default defineSchema({
  speakers: defineTable({
    slug: v.string(),
    name: v.string(),
    role: v.string(),
    title: v.string(),
    order: v.number(),
    sessionStatus: v.union(
      v.literal("OPEN"),
      v.literal("VOTING"),
      v.literal("FINISHED"),
    ),
  })
    .index("by_order", ["order"])
    .index("by_slug", ["slug"]),

  questions: defineTable({
    speakerId: v.id("speakers"),
    text: v.string(),
    deviceId: v.string(),
    status: v.union(
      v.literal("visible"),
      v.literal("hidden"),
      v.literal("answered"),
    ),
    createdAt: v.number(),
  })
    .index("by_speaker", ["speakerId"])
    .index("by_speaker_status", ["speakerId", "status"])
    .index("by_speaker_device", ["speakerId", "deviceId"]),

  votes: defineTable({
    questionId: v.id("questions"),
    deviceId: v.string(),
    createdAt: v.number(),
  })
    .index("by_question", ["questionId"])
    .index("by_question_device", ["questionId", "deviceId"]),

  words: defineTable({
    displayWord: v.string(),
    normalizedWord: v.string(),
    deviceId: v.string(),
    createdAt: v.number(),
  })
    .index("by_device", ["deviceId"])
    .index("by_normalized_word", ["normalizedWord"]),

  eventState: defineTable({
    afterUnlocked: v.boolean(),
    updatedAt: v.number(),
  }),
});
