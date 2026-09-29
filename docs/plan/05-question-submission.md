# Commit 05 — Anonymous question submission

**Status:** not started  
**Commit message:** `feat: add anonymous question submission`  
**Read first:** this file, after commit 04 is green

## Goal

A participant can send one question per speaker while that speaker is `OPEN`. The list shows visible questions. Voting comes in the next commit.

## Depends on

Device helper, Convex schema, speaker config.

## Add primitives

```bash
npx shadcn@latest add textarea tabs label sonner
```

Use `sonner` for the single failure message. Wire `<Toaster />` only in the questions layout, not the root layout.

## Files

- `convex/questions.ts`
- `src/lib/text.ts` — `normalizeQuestionText`
- `src/app/questions/layout.tsx` — `ConvexProvider` plus toaster, only for this segment
- `src/app/questions/page.tsx` — replace the stub
- `src/components/questions/speaker-tabs.tsx`
- `src/components/questions/question-form.tsx`
- `src/components/questions/question-list.tsx`

## Text rules

`normalizeQuestionText(input: string): string`

- Replace HTML characters with nothing that could render as markup. Store plain text. React text nodes are enough on the way out; still strip `<` and `>` before insert so a later `dangerouslySetInnerHTML` cannot appear by accident. Do not use `dangerouslySetInnerHTML`.
- `trim`
- Reject length outside `QUESTION_MIN`–`QUESTION_MAX` (3–280)

Client and Convex both use this. Share the function if the bundler allows `convex/` to import `src/lib/text.ts`. Otherwise duplicate the function in `convex/questions.ts` and keep the client copy, with the same constants.

## Mutation `questions.submit`

Args: `speakerSlug`, `text`, `deviceId`.

Order of checks:

1. `deviceId` matches the UUID shape. Reject otherwise.
2. Speaker exists for `speakerSlug`.
3. `sessionStatus === "OPEN"`. Other statuses reject with a clear error.
4. Normalize text. Reject empty, too short, too long.
5. Query `by_speaker_device` for this speaker and device. If a row exists, reject. This is the one-question limit. Do not delete the old row.
6. If that device’s newest question `createdAt` is within `SUBMIT_GAP_MS`, reject.
7. Insert `{ speakerId, text, deviceId, status: "visible", createdAt: Date.now() }`.

Return the new id. Do not return `deviceId`.

## Query `questions.listBySpeaker`

Args: `speakerSlug`, `deviceId` (optional, for `isMine` only).

- Resolve the speaker.
- Read questions for that speaker where status is `visible` or `answered`. Never return `hidden`.
- Sort by `createdAt` ascending for now. Commit 06 changes the sort to votes, then `createdAt`.
- Each item: `_id`, `text`, `status`, `createdAt`, `isMine`.
- `isMine` is true only when `deviceId` was passed and matches. Never include `deviceId` in the result.

## UI

Tabs: `Maria | Paulo | Samanta`, built with the shadcn tabs primitive. Active tab is obvious (selected state plus the name in the form heading). Default tab is Maria. Tab state can live in the query string `?speaker=paulo-reis` so refresh keeps the speaker. Invalid slug falls back to Maria.

Form heading: `Pergunta para {name}`.

Placeholder: `Escreve aqui a tua pergunta`.

Submit label: `Enviar`.

While the mutation is in flight, disable the button. On failure, keep the typed text and toast:

```text
Não conseguimos concluir esta ação. Tenta novamente.
```

On success, replace the form for that speaker with:

```text
Pergunta enviada.

Agora ajuda a escolher o que deve chegar ao palco.
```

The list still shows the question. The row with `isMine` shows `A tua pergunta` in addition to the text. That label is local to the device.

If this device already has a question for the speaker on load, show the success state immediately, no form.

If session status is not `OPEN`, hide the form and show:

- `VOTING`: `Esta intervenção já não aceita perguntas. Ainda podes votar.` Voting buttons arrive in commit 06; the sentence can mention voting already.
- `FINISHED`: `Esta intervenção está encerrada.`

Empty list:

```text
Ainda ninguém fez uma pergunta ao {first name}.

Queres ser o primeiro?
```

Use the first token of `name` (Maria, Paulo, Samanta).

Show a live character count out of 280.

## Realtime

The list uses a Convex `useQuery`. A second browser sees a new question without refresh.

## Done when

- One device can submit one question to each of the three speakers
- A second question to the same speaker is rejected by the mutation even if the form is forced
- A non-`OPEN` speaker rejects the mutation
- Hidden is not a status the client can set
- Public results have no `deviceId`
- Questions layout is the first tree that mounts `ConvexProvider`
- `npm run build` succeeds

## Do not

- Add vote buttons yet
- Add admin hide/restore
- Trust the client limit alone
