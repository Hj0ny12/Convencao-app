# Commit 03 — Convex data model

**Status:** not started  
**Commit message:** `feat: configure convex data model`  
**Read first:** this file, after commit 02 is green

## Goal

Convex schema, indexes, speaker seed, and a single event-state row. No participant UI calls yet.

## Depends on

`src/lib/speakers.ts` from commit 02.

## Files

- `convex/schema.ts`
- `convex/constants.ts`
- `convex/speakers.ts`
- `convex/eventState.ts`
- `convex/tsconfig.json` (whatever `npx convex dev` / `npx convex codegen` generates)
- `package.json` — `convex` dependency
- `.env.example` — `NEXT_PUBLIC_CONVEX_URL` already listed; keep it
- `.gitignore` — ignore `.env.local` if not already ignored. Commit `convex/_generated` if the Convex docs for this version say the generated client is committed. Do not commit the deploy key.

## Schema

```ts
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
}).index("by_order", ["order"])
 .index("by_slug", ["slug"])

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
  .index("by_speaker_device", ["speakerId", "deviceId"])

votes: defineTable({
  questionId: v.id("questions"),
  deviceId: v.string(),
  createdAt: v.number(),
}).index("by_question", ["questionId"])
 .index("by_question_device", ["questionId", "deviceId"])

words: defineTable({
  displayWord: v.string(),
  normalizedWord: v.string(),
  deviceId: v.string(),
  createdAt: v.number(),
}).index("by_device", ["deviceId"])
 .index("by_normalized_word", ["normalizedWord"])

eventState: defineTable({
  afterUnlocked: v.boolean(),
  updatedAt: v.number(),
})
```

Define the tables now so later commits do not reshape them. This commit only writes functions for speakers and event state.

## `convex/constants.ts`

```ts
export const QUESTION_MIN = 3
export const QUESTION_MAX = 280
export const WORD_MAX = 30
export const SUBMIT_GAP_MS = 2000
```

Later commits import these. Do not duplicate the numbers in components except by importing a mirrored `src/lib/limits.ts` that re-exports the same values. If Convex cannot import from `src/`, keep the numbers only in `convex/constants.ts` and re-export them to the client through a tiny `src/lib/limits.ts` that copies the four numbers with a comment pointing at `convex/constants.ts`. One of those two approaches, not both drifting.

## Functions this commit

`convex/speakers.ts`

- `list` query: all speakers sorted by `order`. Returns slug, name, role, title, order, sessionStatus, `_id`. No other fields.
- `seed` mutation: idempotent. For each entry in the same three slugs, insert if `by_slug` is empty. Seed fields must match `src/lib/speakers.ts` (import the config if the Convex bundler allows it; otherwise duplicate once inside `seed` and add a comment that `src/lib/speakers.ts` is the display source). Initial `sessionStatus` is `OPEN`.

`convex/eventState.ts`

- `get` query: the single row. If none exists, return `{ afterUnlocked: false, updatedAt: 0 }` without inserting (queries should stay read-only).
- `ensure` mutation: insert `{ afterUnlocked: false, updatedAt: Date.now() }` when the table is empty. No-op when a row exists.

Do not add public setters for `sessionStatus` or `afterUnlocked` yet. Those are admin mutations in later commits.

## Provider

Do not mount `ConvexProvider` in the root layout. This commit may add `src/components/convex-provider.tsx` (`"use client"`) for later routes, unused by home and agenda.

## Done when

- `npx convex codegen` (or the project’s equivalent) succeeds
- Schema matches the tables and indexes above
- Running `seed` twice does not duplicate speakers
- Running `ensure` twice does not duplicate event state
- Home and agenda still render from `src/lib/speakers.ts` with no Convex hook
- `npm run build` succeeds

## Do not

- Add question or vote mutations
- Change session status from the UI
- Put the Convex deploy key in the repo
