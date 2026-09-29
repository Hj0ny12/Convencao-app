# Commit 07 — Admin authentication

**Status:** not started  
**Commit message:** `feat: add admin authentication`  
**Read first:** this file and the "Admin session shape" section in [README.md](./README.md), after commit 06 is green

## Goal

`/admin/login` accepts the shared passphrase and sets a signed cookie. Every other `/admin` route redirects to login when the cookie is missing or invalid. No moderation UI yet.

## Depends on

Working public app. Convex is not required to render the login form. The token helper must be callable from Convex in the next commit, so put the verify algorithm in a dependency-free module.

## Files

- `src/lib/admin-session.ts` — sign, verify, cookie name, TTL. Web Crypto HMAC-SHA256. No Node-only `crypto` import if a Convex bundle would break; use `globalThis.crypto.subtle`.
- `src/lib/admin-auth.ts` — server-only: read cookie, set cookie, clear cookie, `requireAdmin()`.
- `src/app/admin/login/page.tsx`
- `src/app/admin/login/actions.ts` — server action `login`
- `src/app/admin/layout.tsx` — calls `requireAdmin()` except the login route must not use this layout. Put the guard in `src/app/admin/(panel)/layout.tsx` and keep `login` outside that group.
- `src/app/admin/(panel)/page.tsx` — placeholder dashboard copy: `Sessão iniciada.`
- `src/app/admin/(panel)/actions.ts` — server action `logout`

Suggested routes:

```text
src/app/admin/login/page.tsx          public
src/app/admin/(panel)/layout.tsx      guarded
src/app/admin/(panel)/page.tsx        guarded
```

## Login

Field label: `Passphrase`. One submit button: `Entrar`.

Server action:

1. Read `ADMIN_PASSPHRASE`. If unset, fail closed with the generic error below.
2. Timing-safe compare of the submitted string and the env value. Do not compare with `===` on the raw strings if lengths can short-circuit; hash both with SHA-256 and compare digests, or compare equal-length buffers.
3. On failure, do not set a cookie. Show `Passphrase incorreta.` Do not say whether the env var is missing.
4. On success, set `fi_admin_session` and `redirect("/admin")`.

Cookie flags: `httpOnly: true`, `secure: true` in production, `sameSite: "lax"`, `path: "/"`, `maxAge` = 18 hours.

Logout clears the cookie and redirects to `/admin/login`.

`requireAdmin()` verifies the cookie with `SESSION_SECRET` and redirects to `/admin/login` when verification fails.

## What the token is

```ts
payload = base64url(JSON.stringify({ exp: unixSeconds }))
token = payload + "." + base64url(hmacSha256(payload, SESSION_SECRET))
```

Verify recomputes the HMAC and checks `exp`. Reject malformed tokens.

The login action does not call Convex. Commit 08 will send this same token into admin Convex functions. The client must be able to read the token for those subscriptions: the panel layout, after `requireAdmin()`, passes the token into an admin client provider as a prop. Do not also copy it to `localStorage`.

Add `src/components/admin/admin-convex-provider.tsx` in this commit even if no admin query runs yet, so commit 08 only adds queries.

## Pages that stay public

`/`, `/agenda`, `/questions`, `/words`, `/after` never read the admin cookie and never load the admin provider.

## Done when

- Wrong passphrase does not set a cookie
- Right passphrase opens `/admin` and shows `Sessão iniciada.`
- Requesting `/admin` without a cookie redirects to `/admin/login`
- A tampered cookie redirects to login
- Logout returns to login and `/admin` is closed again
- View source / client bundles do not contain `ADMIN_PASSPHRASE` or `SESSION_SECRET`
- `npm run build` succeeds

## Do not

- Add user management, a second password, OAuth, or Clerk
- Put the passphrase in Convex
- Build the question moderation table in this commit
