# Commit 02 — Event shell and agenda

**Status:** not started  
**Commit message:** `feat: add event shell and agenda`  
**Read first:** this file, after commit 01 is green

## Goal

Mobile shell: home, agenda, bottom nav, speaker config. Static. No Convex and no `localStorage` yet.

## Depends on

Commit 01, including shadcn init.

## Add primitives

```bash
npx shadcn@latest add button
```

`button` is the only primitive this commit needs. Links styled as buttons are fine for the two home actions.

## Files

- `src/lib/speakers.ts` — the only speaker/agenda source
- `src/components/layout/event-shell.tsx` — column layout, header, main, bottom nav slot
- `src/components/navigation/bottom-nav.tsx`
- `src/app/page.tsx` — replace the placeholder
- `src/app/agenda/page.tsx`
- `src/app/questions/page.tsx` — stub
- `src/app/words/page.tsx` — stub
- `src/app/after/page.tsx` — stub
- `src/app/layout.tsx` — wrap public pages in the shell

Admin and `/screen` routes do not exist yet. Do not reserve empty admin folders.

## `src/lib/speakers.ts`

Export one array and nothing else that duplicates it. Shape:

```ts
export type Speaker = {
  slug: "maria-corominas" | "paulo-reis" | "samanta"
  time: string
  name: string
  role: string
  title: string
  order: number
}

export const speakers: Speaker[]
```

Times and talk titles can be placeholders (`10:15`, `Título da intervenção`) until the real agenda is confirmed. Names and roles are the ones in the plan README. `order` is 0, 1, 2.

Export `getSpeaker(slug)` for later commits. Do not hardcode these names inside page components.

## Shell

- Mobile first, max width about 480px, centered on larger screens
- Dark, high contrast, one accent color already available from the shadcn CSS variables
- No card grid, no marketing sections, no carousel
- Header is the event name, not a logo farm
- Bottom nav is fixed, four items, ~44px targets: `Agenda` → `/agenda`, `Perguntas` → `/questions`, `1 Palavra` → `/words`, `After` → `/after`
- Active item is `aria-current="page"` plus weight or underline, not color alone
- Use the Next `Link` component

## Home copy

```text
FI Group Convention 2026

A Convenção também acontece aqui.

[Fazer uma pergunta]  → /questions
[Ver agenda]          → /agenda

Participação anónima. Não pedimos nome, email ou conta.
```

Primary action is the question link. Secondary is the agenda link.

## Agenda

Render `speakers` in `order`. Each row shows time, name, role, title. No PDF. No photos in this commit.

## Stubs

Questions, words, and After pages each render their nav label and one short line so the tabs are not dead ends:

- Perguntas: `As perguntas abrem em breve.`
- 1 Palavra: `A palavra abre em breve.`
- After: `Ainda não.`

## Done when

- Home matches the copy above and the question link is the primary button
- Agenda lists three speakers from `speakers.ts` only
- All four nav items route and show the active state
- No Convex client on these pages
- `npm run build` succeeds

## Do not

- Add question forms, voting, word forms, or the slot machine
- Fetch remote data
- Add `textarea`, `tabs`, or `sonner` yet
