# Commit 10 — One word

**Status:** not started  
**Commit message:** `feat: add one word experience`  
**Read first:** this file, after commit 09 is green

## Goal

Each device submits one word. The server stores a display form and a normalized form. The public page confirms the submission. The cloud graphic is the next commit.

## Depends on

Device helper, `words` table from commit 03.

## Files

- `src/lib/text.ts` — add `normalizeWord`
- `convex/words.ts`
- `src/app/words/layout.tsx` — Convex provider for this segment
- `src/app/words/page.tsx` — replace the stub
- `src/components/words/word-form.tsx`

Reuse `input`, `label`, `button`, and `sonner` (mount the toaster in the words layout).

## `normalizeWord`

Input examples and results:

| Input | displayWord | normalizedWord |
| --- | --- | --- |
| `  Inovação ` | `Inovação` | `inovação` |
| `INOVAÇÃO` | `INOVAÇÃO` | `inovação` |
| `inovação` | `inovação` | `inovação` |
| `inovacao` | `inovacao` | `inovacao` |

Rules:

- Trim ends
- Strip simple wrapping punctuation from both ends: `.,!?;:"'«»()[]` 
- Reject empty
- Reject if any whitespace remains (more than one word)
- Reject if longer than `WORD_MAX` (30)
- `normalizedWord` is `displayWord.toLocaleLowerCase("pt-PT")`
- Do not strip accents
- `displayWord` keeps the submitter’s casing

## Mutation `words.submit`

Args: `raw`, `deviceId`.

1. UUID-shaped device id.
2. `by_device`: if this device already has a row, reject.
3. `normalizeWord`. On failure, reject.
4. If this device somehow has a row newer than `SUBMIT_GAP_MS`, reject. The one-row rule already covers repeats; keep the gap check only for double taps before the first insert is visible. Implementing the unique check is the real guard.
5. Insert `{ displayWord, normalizedWord, deviceId, createdAt }`.

Do not return `deviceId`.

## Query `words.mine`

Args: `deviceId`. Returns `{ displayWord } | null`. Used so the form closes on reload. Do not use this query to build the cloud.

## UI copy

```text
Se tivesses de definir a FI Group numa palavra, qual seria?
```

Single-line input, `maxLength={30}`, submit `Enviar`.

Success:

```text
Palavra enviada.

{displayWord}
```

Failure toast: the same “Não conseguimos concluir esta ação. Tenta novamente.” Keep the typed value on failure.

Disable the button while pending.

## Done when

- First submit stores both fields
- `Inovação` and ` inovação ` share `normalizedWord` `inovação` and keep their own `displayWord`
- A second submit from the same device is rejected by Convex
- Two words (`FI Group`) are rejected
- Accents are preserved
- The public page does not list other people’s raw rows
- `npm run build` succeeds

## Do not

- Draw the word cloud yet
- Show a live feed of individual submissions on `/words`
