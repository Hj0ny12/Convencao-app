# Commit 09 — Host live view

**Status:** not started  
**Commit message:** `feat: add host live view`  
**Read first:** this file, after commit 08 is green

## Goal

`/admin/live` is a quiet full-screen list of the top questions for one speaker. The host can read it during a talk.

## Depends on

Admin session and the public ranking rules.

## Files

- `src/app/admin/(panel)/live/page.tsx`
- `src/components/admin/live-board.tsx`
- Reuse `admin.setSessionStatus` only if the live view needs the current status. Do not put moderation buttons here.

The page stays behind the panel layout guard. It does not use the public bottom nav. A one-line link back to `/admin` is enough. No sidebar.

## Query

`admin.liveQuestions(sessionToken, speakerSlug)` 

- `assertSession`
- Speaker by slug
- Questions with status `visible` only, when a local UI toggle `Mostrar respondidas` is off
- When the toggle is on, include `answered` as well
- Never include `hidden`
- Sort: vote count desc, `createdAt` asc
- Return the top 10: rank, text, voteCount, status
- No `deviceId`

The toggle is client state, default off, so the host sees unanswered questions first. Pass the mode as an argument, or filter `answered` on the client from a payload that includes both `visible` and `answered`. Client filter is fine: the payload is already admin-only.

## Layout

```text
PAULO REIS                          OPEN

1.
▲ 48
Pergunta...

2.
▲ 37
Pergunta...
```

- Speaker name in uppercase is acceptable here because it is a stage cue
- Speaker switcher: three text buttons, Maria / Paulo / Samanta, not a dropdown
- Type size large enough to read at a glance on a laptop. This route is the exception to the 390px-only layout: it should still work on a phone, but the type scale targets a laptop on a lectern
- Answered rows, when shown, use the badge from commit 08
- Empty: `Ainda não há perguntas visíveis.`

## Done when

- A logged-out visit redirects to login
- Votes cast on a phone move the numbers on this page without refresh
- Hiding a question removes it from this list
- The host can switch speakers without leaving the page
- The page has no vote button, no hide button, and no analytics
- `npm run build` succeeds

## Do not

- Make `/admin/live` public
- Auto-advance speakers on a timer
