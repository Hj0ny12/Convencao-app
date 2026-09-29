# FI Group Convention Live — implementation plan

Read this file once, then read **only the next commit file** before writing that commit. Do not implement a later commit in the same change. Each commit must leave the app working.

The product is one mobile-first web app for a single FI Group Portugal convention (~120 people). Scan, open, interact. No accounts for participants.

Source of truth for behavior: the PRD. These files turn that PRD into code slices. If a file and the PRD disagree, stop and follow the PRD.

## How to use these files

1. Finish the previous commit and confirm its "Done when" checks.
2. Open the next file in the table below. Read it fully before editing.
3. Create only the files that commit lists. Reuse what earlier commits already added.
4. Commit with the message in that file.
5. Do not start the following commit in the same commit.

## Locked decisions

- Next.js App Router, TypeScript, Tailwind, `src/` directory.
- Convex is the backend and the realtime source. No Redis, no custom WebSocket server, no separate API service.
- Convex is linked to the dev deployment through gitignored `.env.local`. There is no SQL migration folder. `convex/schema.ts` is the database.
- UI primitives are shadcn/ui (Radix base), copied into `src/components/ui` by the CLI. Compose event screens from those primitives. Do not add a second component library.
- Motion is CSS, then the Web Animations API. No animation library unless a later file says so.
- Participants have no login. `crypto.randomUUID()` stored in `localStorage` under `fi-convention-device-id`.
- Limits and admin actions are enforced on the server. Hiding a button is not enforcement.
- Admin auth is one shared passphrase in an environment variable, then a signed cookie. Both admins use the same credential. The passphrase never goes to Convex and never goes to `localStorage`.
- Agenda text and speaker identity live in one TypeScript config. Session status and participant submissions live in Convex.
- UI copy is Portuguese, written in the components. Do not add an i18n framework.
- `noindex, nofollow`. This app is not for search.
- Do not build anything in "Out of scope" below.

## Target layout

```text
src/
  app/
  components/
    ui/            shadcn primitives
    layout/
    navigation/
    questions/
    speakers/
    words/
    after/
    admin/
  lib/
    speakers.ts
    limits.ts
    text.ts
    anonymous-device.ts
    admin-session.ts
    employees.ts
convex/
  schema.ts
  constants.ts
  speakers.ts
  questions.ts
  votes.ts
  words.ts
  eventState.ts
  admin.ts
public/
  employees/
docs/
  plan/
```

Paths can move slightly if the framework default is clearer. Do not invent extra layers (`services/`, `repositories/`, `domain/`).

## Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Vercel | Convex client |
| `ADMIN_PASSPHRASE` | Vercel only | Login form |
| `SESSION_SECRET` | Vercel and Convex | HMAC for the admin session token |
| `CONVEX_DEPLOY_KEY` | Vercel only, if a slice needs it | Server-side Convex admin calls |

Never commit real values. `.env.example` lists the names only.

## Security invariants (every commit)

- Public Convex queries never return `deviceId`.
- A device recognizes its own question via an `isMine` boolean computed inside the query.
- A device recognizes its vote via a `votedByMe` boolean computed inside the query.
- Admin queries and mutations require a session token checked with `SESSION_SECRET` inside Convex. The browser receives that token only after a successful login, from the server, so it can subscribe. It is not the passphrase.
- Do not log the passphrase, the session token, or question text tied to a device.

## Admin session shape

Used from commit 07 onward.

- Cookie name: `fi_admin_session`
- Flags: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- Token payload: `{ exp }` HMAC-SHA256 with `SESSION_SECRET`
- TTL: 18 hours (`SESSION_TTL_SECONDS` in one place)
- Convex admin functions take `sessionToken` as an argument and reject it when the HMAC or expiry check fails
- Compare the passphrase with a timing-safe equal

`SESSION_SECRET` must be the same value in Vercel and Convex. `ADMIN_PASSPHRASE` exists only in Vercel.

## shadcn rule

Initialize with the Radix base:

```bash
npx shadcn@latest init -d --base radix
```

Add a primitive only in the commit that first renders it. Expected set across the whole MVP:

| Primitive | First used |
| --- | --- |
| `button`, `input`, `label` | Commit 02 |
| `textarea`, `tabs`, `sonner` | Commit 05 |
| `badge` | Commit 08 |

Do not run `shadcn add --all`.

## Performance rule

- Convex client provider wraps only routes that subscribe: questions, words, after, admin. Home and agenda stay server-rendered without it.
- Employee photos load only with the After experience, not from the root layout.
- Reference viewport: 390×844. Touch targets about 44px. Support `prefers-reduced-motion`.

## Speaker ids

Use these slugs everywhere (`src/lib/speakers.ts` and the Convex seed):

| slug | name | role |
| --- | --- | --- |
| `maria-corominas` | Maria Corominas | CEO FI Group |
| `paulo-reis` | Paulo Reis | Diretor Geral, FI Group Portugal |
| `samanta` | Samanta | Intervenção sobre pessoas e colaboradores em Portugal |

Session status values: `OPEN`, `VOTING`, `FINISHED`. Seed all three as `OPEN`.

Question status values: `visible`, `hidden`, `answered`.

## Out of scope

Do not add: participant accounts, profiles, departments, push, comments, threads, participant ranking, badges, points, extra polls, chat, AI, automatic moderation, analytics, a CMS, multiple events, multi-tenant, RBAC, SSO, PWA, a native app, cross-event history, Excel export, or a public API.

## Commits

| # | File to read first | Commit message |
| --- | --- | --- |
| 01 | [01-bootstrap.md](./01-bootstrap.md) | `chore: bootstrap convention app` |
| 02 | [02-event-shell-and-agenda.md](./02-event-shell-and-agenda.md) | `feat: add event shell and agenda` |
| 03 | [03-convex-data-model.md](./03-convex-data-model.md) | `feat: configure convex data model` |
| 04 | [04-anonymous-device.md](./04-anonymous-device.md) | `feat: add anonymous device identity` |
| 05 | [05-question-submission.md](./05-question-submission.md) | `feat: add anonymous question submission` |
| 06 | [06-realtime-voting.md](./06-realtime-voting.md) | `feat: add realtime question voting` |
| 07 | [07-admin-auth.md](./07-admin-auth.md) | `feat: add admin authentication` |
| 08 | [08-question-moderation.md](./08-question-moderation.md) | `feat: add question moderation` |
| 09 | [09-host-live-view.md](./09-host-live-view.md) | `feat: add host live view` |
| 10 | [10-one-word.md](./10-one-word.md) | `feat: add one word experience` |
| 11 | [11-word-cloud.md](./11-word-cloud.md) | `feat: add realtime word cloud` |
| 12 | [12-after-slot-machine.md](./12-after-slot-machine.md) | `feat: add after unlock and slot machine` |
| 13 | [13-mobile-performance.md](./13-mobile-performance.md) | `perf: optimize mobile event experience` |
| 14 | [14-harden-flows.md](./14-harden-flows.md) | `test: harden convention flows` |
