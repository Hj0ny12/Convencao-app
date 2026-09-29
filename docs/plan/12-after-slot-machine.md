# Commit 12 — After unlock and slot machine

**Status:** not started  
**Commit message:** `feat: add after unlock and slot machine`  
**Read first:** this file, after commit 11 is green

## Goal

After stays locked until an admin unlocks it. Open clients flip in realtime. The slot machine picks a local result once per browser session and does not download employee photos before this screen needs them.

## Depends on

`eventState` from commit 03, admin session from commit 07.

## Files

- `convex/eventState.ts` — add admin mutation `setAfterUnlocked`
- `src/lib/employees.ts` — manifest
- `public/employees/` — optimized images, or a small set of placeholders if finals are not in the repo yet
- `src/app/after/layout.tsx` — Convex provider
- `src/app/after/page.tsx` — replace the stub
- `src/components/after/locked-after.tsx`
- `src/components/after/slot-machine.tsx` — loaded with `next/dynamic` from the After page only
- `src/app/admin/(panel)/page.tsx` — add the unlock control to the existing dashboard

## Event state

`eventState.get` already exists and is public. It may return only:

```ts
{ afterUnlocked: boolean }
```

Do not add other flags.

`admin.setAfterUnlocked(sessionToken, afterUnlocked: boolean)`

- `assertSession`
- Update the single row and `updatedAt`
- If `ensure` was never called, insert the row then set the flag
- Allow locking again (`false`) so a rehearsal can reset. The public copy returns to the locked state.

## Dashboard control

Button label when locked: `Desbloquear After`.  
When unlocked: `Bloquear After`.

Show the current state in text: `After bloqueado` or `After desbloqueado`.

## Public `/after` before unlock

```text
AFTER

Ainda não.

Volta aqui no final 👀
```

The After tab is visible all day. Do not import `slot-machine.tsx` while `afterUnlocked` is false. Dynamic import inside the unlocked branch:

```ts
const SlotMachine = dynamic(() => import("@/components/after/slot-machine"), {
  ssr: false,
  loading: () => null,
})
```

## Manifest

```ts
export type Employee = {
  id: string
  name: string
  image: string
}

export const employees: Employee[]
```

Image paths point at `/employees/{id}.webp`. Keep the array in this file only.

Until real photos exist, generate a few solid-color WebP placeholders (at least 8) with the names from the PRD example plus obvious fakes marked in a comment, including `guilherme-matos`. Replace file bytes later without changing the component. Do not hotlink remote portraits.

Images: WebP, square, small (around 256px). The slot uses a CSS square, not the intrinsic full photo.

## Slot machine

Headline: `Onde é o After?`  
Button: `DESCOBRIR`

On press:

1. If `sessionStorage` key `fi-convention-after-result` already has an employee id, skip the animation and show that person.
2. Otherwise choose `employees[Math.floor(Math.random() * employees.length)]` in the browser. Do not call Convex.
3. Write the id to `sessionStorage` before the animation finishes, so a refresh during the spin cannot re-roll.
4. Animation: cycle images quickly, slow down, stop on the chosen person.
5. Result:

```text
O AFTER É NO QUARTO DO

{NAME}
```

`prefers-reduced-motion`: no rapid image cycle. Show a short fade, then the result.

Preload images when the slot module mounts, not in the root layout and not on the locked screen. A few seconds of prefetch before unlock is optional and easy to get wrong; skip prefetch. Load on mount of the slot only.

The button disables after the result is stored so the same session cannot hunt for a name. Closing the tab clears `sessionStorage` and allows a new result later. That is the PRD rule.

## Done when

- Locked copy shows while `afterUnlocked` is false, and the network panel does not request `/employees/*` on `/` or on locked `/after`
- Admin unlock changes an already-open `/after` tab without refresh
- Two phones can show different names
- Refresh keeps the same name for that tab session
- Reduced-motion does not run the fast cycle
- Relock returns the public page to the locked copy
- `npm run build` succeeds

## Do not

- Store the winner in Convex
- Add sound that autoplays
- Build a share card or a download button
