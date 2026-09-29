# Commit 01 — Bootstrap

**Status:** not started  
**Commit message:** `chore: bootstrap convention app`  
**Read first:** [README.md](./README.md)

## Goal

A Next.js app that builds, ships to Vercel, and is not indexable. No event UI yet.

## Depends on

Empty repo.

## Files

Create the App Router project in this repo (do not nest a second folder):

- `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- `components.json` and `src/lib/utils.ts` (`cn`) from shadcn init
- `.env.example`
- `.gitignore` covering `node_modules`, `.next`, `.env`, `.env*.local`, `.vercel`

Leave `src/app/page.tsx` as a single line of text: `FI Group Convention 2026`. The real home is commit 02.

## Commands

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack --yes
npx shadcn@latest init -d --base radix
```

If `create-next-app` refuses a non-empty directory because of `docs/` or `README.md`, scaffold in a temp directory and move the app files into the repo root without deleting `docs/plan`.

Do not add Convex, fonts beyond the create-next-app default, or any shadcn component yet. Init only writes the config, CSS variables, and `cn`.

## Metadata

In the root layout metadata:

- title: `FI Group Convention 2026`
- description: `A Convenção também acontece aqui.`
- robots: `{ index: false, follow: false }`

Also add a robots meta fallback if the Next metadata robots field is not enough for this Next version. The response must send `noindex, nofollow`.

## `.env.example`

```text
NEXT_PUBLIC_CONVEX_URL=
ADMIN_PASSPHRASE=
SESSION_SECRET=
```

No values.

## Done when

- `npm run build` succeeds
- `/` renders the placeholder line
- HTML includes `noindex`
- `components.json` exists and its base is Radix
- No secrets in the diff

## Do not

- Build navigation, agenda, or Convex
- Add analytics, a PWA manifest, or auth
