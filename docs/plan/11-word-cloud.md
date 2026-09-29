# Commit 11 — Realtime word cloud

**Status:** not started  
**Commit message:** `feat: add realtime word cloud`  
**Read first:** this file, after commit 10 is green

## Goal

Aggregate words by `normalizedWord` and show them on an admin page and a clean projector page.

## Depends on

`words` rows with `displayWord` and `normalizedWord`.

## Files

- `convex/words.ts` — add `cloud` query
- `src/components/words/word-cloud.tsx`
- `src/app/admin/(panel)/words/page.tsx`
- `src/app/screen/words/page.tsx`
- `src/app/screen/layout.tsx` — no bottom nav, no admin chrome

## Query `words.cloud`

No auth. It returns only aggregates:

```ts
{ displayWord: string; count: number }[]
```

- Group by `normalizedWord`
- `displayWord` is the `displayWord` of the earliest row in the group (first valid spelling)
- `count` is the number of rows
- Sort by `count` descending, then `displayWord` ascending
- Do not return `deviceId`, `normalizedWord` is optional to omit; omitting it is safer. The component only needs display text and count.

This query is public because the projector page has no login. That matches the PRD.

## Component

`word-cloud.tsx` is a server-safe presentational component if the parent passes data, plus a thin client wrapper that subscribes and passes data in. Prefer one client wrapper used by both pages so the scale math lives once.

Scale: font size from the min count to the max count in the current result, clamped so one word cannot overflow the viewport. A word with count 1 stays readable. A word with the max count is the largest.

Render the words as text, uppercase is acceptable to match the PRD sketch. Keep the real `displayWord` casing if uppercasing would destroy meaning; the PRD sketch is uppercase, so uppercase the visual label with CSS `uppercase` and keep the accessible name as `displayWord`.

Empty state, both routes:

```text
As palavras começam a aparecer assim que o público participa.
```

## `/screen/words`

- Full viewport, dark, no buttons, no nav, no “admin” label
- Subscribes to `words.cloud`
- `noindex` already comes from the root layout

## `/admin/words`

- Same cloud
- Plus a count of total submissions: `{n} palavras`
- No delete button in this MVP. Moderation of a word is out of scope unless a word must be removable to survive the event. If you add delete, it has to be an admin mutation with `assertSession` and it is extra scope: do not add it in this commit.

## Done when

- Two devices submitting `Inovação` and `inovação` produce one cloud entry with count 2 and the first spelling
- `/screen/words` updates without refresh and shows no controls
- `/admin/words` is behind login
- A public visitor cannot see device ids through the cloud query
- `npm run build` succeeds

## Do not

- Add a word-cloud npm package
- Pull every raw word to the browser and group there
