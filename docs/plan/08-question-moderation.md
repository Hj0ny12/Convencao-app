# Commit 08 — Question moderation

**Status:** not started  
**Commit message:** `feat: add question moderation`  
**Read first:** this file, after commit 07 is green

## Goal

Two admins can see counts, hide or restore a question, mark it answered, and change each speaker’s session status. Public clients update through the existing questions subscription.

## Depends on

Admin session token, question and speaker tables.

## Add primitives

```bash
npx shadcn@latest add badge
```

Use `badge` for `visible`, `hidden`, `answered`, and the session status. Pair the badge with text, not color alone.

## Files

- `convex/admin.ts` — `assertSession(sessionToken)` using the same HMAC rules as `src/lib/admin-session.ts`. Share the verify function if Convex can import it; otherwise copy the verify function once into `convex/admin.ts` and keep the format identical.
- Extend `convex/questions.ts` or add admin queries in `convex/admin.ts`
- `src/app/admin/(panel)/page.tsx` — replace the placeholder with counts
- `src/app/admin/(panel)/questions/page.tsx`
- `src/components/admin/speaker-summary.tsx`
- `src/components/admin/moderation-list.tsx`
- `src/components/admin/session-status-control.tsx`

Set `SESSION_SECRET` in the Convex dashboard env before trying admin mutations. Same value as Vercel.

## Auth check

Every admin query and mutation starts with `assertSession`. Invalid token throws. Do not catch that and return empty data that looks like success.

Public functions from commits 05 and 06 stay public and do not accept a session token.

## Dashboard `/admin`

For each speaker, in `order`:

```text
Maria Corominas
37 perguntas
124 votos
```

Counts include hidden questions in the question total, so the admin sees volume. Vote total is the sum of votes on that speaker’s questions. No charts.

## Moderation `/admin/questions`

Group by speaker. Each question shows text, status badge, vote count, and actions:

- `Ocultar` when status is not `hidden`
- `Restaurar` when status is `hidden` (sets `visible`, not `answered`)
- `Marcar como respondida` when status is not `answered`
- `Reabrir` when status is `answered` (sets `visible`) so a mis-tap is recoverable. The PRD requires mark-answered; reopen is the matching undo.

Mutations:

- `admin.setQuestionStatus(sessionToken, questionId, status)`
- `admin.setSessionStatus(sessionToken, speakerSlug, sessionStatus)` where session status is `OPEN` | `VOTING` | `FINISHED`

Session control sits at the top of each speaker group. Three buttons, current one pressed.

`hidden` questions disappear from `questions.listBySpeaker` without a refresh on an open participant phone. `answered` questions stay in that list. Participant form and vote gates already read `sessionStatus`; changing it here is enough.

## Realtime

Admin lists use `useQuery` with the session token from the provider. Two browsers logged in with the same passphrase both update.

## Done when

- Hide removes the question from a public list immediately
- Restore brings it back
- Answered is visually distinct in admin and still public
- `VOTING` blocks new questions and still allows votes, verified by calling the existing public mutations
- `FINISHED` blocks questions and votes
- A missing token cannot call `setQuestionStatus`
- Dashboard numbers match the tables
- `npm run build` succeeds

## Do not

- Build the host live view in this commit (next file)
- Add automatic moderation or edit-the-question-text
