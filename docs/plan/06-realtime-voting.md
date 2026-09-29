# Commit 06 — Realtime question voting

**Status:** not started  
**Commit message:** `feat: add realtime question voting`  
**Read first:** this file, after commit 05 is green

## Goal

One vote per device per question, reversible, with an instant count and a server rollback if the mutation fails.

## Depends on

Question list and device id.

## Files

- `convex/votes.ts`
- `src/components/questions/vote-button.tsx`
- Update `convex/questions.ts` list query to attach `voteCount` and `votedByMe` and to sort
- Update `question-list.tsx` to render the button

No new shadcn primitive unless the button primitive from commit 02 cannot do a toggle. Use `button`.

## Query changes

`questions.listBySpeaker` items gain:

```ts
voteCount: number
votedByMe: boolean
```

`votedByMe` uses the same optional `deviceId` argument as `isMine`. Do not return the votes array or any voter id.

Sort:

1. `voteCount` descending
2. `createdAt` ascending

Count votes with the `by_question` index. Do not scan the whole votes table for every question if the index can do it. A per-question indexed lookup is enough at this size.

## Mutations

`votes.cast` args: `questionId`, `deviceId`.

1. UUID-shaped `deviceId`.
2. Question exists and status is not `hidden`. `visible` and `answered` can be voted only when the speaker session allows votes. `answered` stays votable in `OPEN` and `VOTING` so the count does not freeze if someone marks it early. In `FINISHED`, reject.
3. Speaker `sessionStatus` is `OPEN` or `VOTING`.
4. Lookup `by_question_device`. If a row exists, return success without inserting a second row (idempotent).
5. Optional gap: if this device’s newest vote is inside `SUBMIT_GAP_MS`, reject. Do not block the first vote.
6. Insert `{ questionId, deviceId, createdAt }`.

`votes.remove` args: `questionId`, `deviceId`.

1. Same session check (`OPEN` or `VOTING`) and the question is not `hidden`.
2. Delete the `by_question_device` row if it exists. If it does not, return success.

Neither mutation returns `deviceId`.

## UI

Each row:

```text
▲ 27
Question text
A tua pergunta          (only if isMine)
```

The control is a real `button` with `aria-pressed`. Label includes the count for assistive tech, for example `Votar, 27 votos`.

On press:

- Optimistic: flip `votedByMe` and increment or decrement `voteCount` immediately
- Disable that button until the mutation settles
- On failure, restore the previous count and pressed state, keep the list otherwise, toast the same failure copy as commit 05

Animation, only when `prefers-reduced-motion` is not set:

- A `+1` or `-1` that fades in under 400ms
- A few pixels of counter movement

No particles, no flying hearts, no looping animation.

`FINISHED` disables every vote button. `VOTING` and `OPEN` leave them enabled. The form rules from commit 05 stay as they are.

## Done when

- Voting updates the number on the device immediately and on a second device via the subscription
- A second cast does not create two rows
- Remove deletes the row and the count drops
- `FINISHED` rejects cast and remove in Convex
- `hidden` questions are still absent from this query
- Sort matches votes, then time
- `npm run build` succeeds

## Do not

- Add moderation controls
- Animate the whole list on each vote
