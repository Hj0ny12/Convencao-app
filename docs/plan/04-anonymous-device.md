# Commit 04 — Anonymous device identity

**Status:** not started  
**Commit message:** `feat: add anonymous device identity`  
**Read first:** this file, after commit 03 is green

## Goal

One client helper that creates and reuses a device id. No question form yet.

## Depends on

App shell from commit 02. Convex is unused by this helper.

## Files

- `src/lib/anonymous-device.ts`
- `src/components/device/device-id-provider.tsx` only if a hook is clearer than a function. Prefer one function plus a tiny hook over a context system.

## Behavior

```ts
const STORAGE_KEY = "fi-convention-device-id"

export function getDeviceId(): string
```

- Call only from client components. The module must not run `localStorage` at import time on the server.
- If the key is missing or the stored value is not a UUID, set `crypto.randomUUID()` and return it.
- If it exists, return it unchanged.
- UUID check: 8-4-4-4-12 hex. Reject anything else and replace it.

Hook shape, if added:

```ts
export function useDeviceId(): string | null
```

Returns `null` on the first server render and the id after mount, so pages do not mismatch hydration. Do not generate the id inside render without `useEffect` or an equivalent client-only path.

## Done when

- A client component can call `useDeviceId()` and, after mount, read a stable UUID
- Reloading the page keeps the same id
- Clearing the key creates a new id
- A bad stored value is replaced
- No network call, no Convex write, no cookie

## Do not

- Collect name, email, employee number, department, or phone
- Put the id in the URL
- Show the id in the UI
- Use the id for admin auth
