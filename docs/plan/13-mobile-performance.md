# Commit 13 — Mobile performance

**Status:** not started  
**Commit message:** `perf: optimize mobile event experience`  
**Read first:** this file, after commit 12 is green

## Goal

Tighten what the earlier commits already shipped. No new feature.

## Depends on

The full public and admin flow.

## Work through this list

1. **Provider scope.** Confirm `ConvexProvider` is absent from the root layout. Home and agenda server-render without `convex/react` in their client graph. Questions, words, after, and admin panel may include it.
2. **After chunk.** Confirm `slot-machine` is a dynamic import and employee images are not referenced from any shared layout.
3. **Fonts.** Keep at most the font `create-next-app` added. Remove extra font imports. Do not add a second display font.
4. **Images.** Employee files are WebP or AVIF, about 256px, reasonable weight (aim under 40KB each). Agenda still has no photo requirement; if a speaker photo was added, use `next/image` with a fixed size.
5. **Client components.** Pages that only render static copy stay server components. `"use client"` stays on the leaves that need state, the Convex hooks, or the browser APIs.
6. **Loading.** Question list, word cloud, and admin lists have a short text fallback (`A carregar…`) instead of a layout jump. Reserve space for the bottom nav so content does not slide under it (`padding-bottom`).
7. **CLS.** The vote count uses tabular numbers so a digit change does not shift the question text. Cloud font sizes should not change the page scrollbar on first paint more than once; reserve a min height.
8. **Motion.** Every animation is skipped or reduced under `prefers-reduced-motion`. Vote `+1` and the slot machine are the two to check.
9. **Touch and contrast.** Interactive controls are at least 44px on the public shell. Text and buttons meet contrast on the dark background. Status is not color-only (badges already include words).
10. **Failure copy.** One string for failed mutations, already specified. No `error.message` from Convex rendered raw if it can include a stack or a document id. Map unknown errors to the generic sentence.

## Budgets

These are targets, not a gate that blocks the commit if a lab machine cannot simulate 4G:

- LCP under 2.0s on a normal 4G profile for `/`
- INP under 200ms for voting
- CLS under 0.1

Record the Lighthouse or Web Vitals numbers you could actually measure in the commit body. If Lighthouse cannot be run, say so in the commit body and list what you checked by hand: transferred JS on `/`, no employee image requests on `/`, vote button stays responsive.

## Done when

- `/` does not download the Convex client or employee images
- `/after` while locked does not download employee images
- Reduced motion is honored for vote feedback and the slot
- No new route or new dependency was added
- `npm run build` succeeds

## Do not

- Rewrite the visual design
- Add a caching layer or a service worker
- Start the test-hardening work here
