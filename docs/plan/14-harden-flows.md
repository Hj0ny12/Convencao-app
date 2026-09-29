# Commit 14 — Harden convention flows

**Status:** done. `npm test` and `npm run build` passed. Manual device and two-browser checks were not run in this environment.  
**Commit message:** `test: harden convention flows`  
**Read first:** this file, after commit 13 is green

## Goal

Automated tests for the rules that must not break during the event, plus a short manual checklist in the commit body for what automation cannot see.

## Depends on

All previous slices.

## Files

- `src/lib/text.test.ts` — question and word normalization
- `src/lib/admin-session.test.ts` — sign, verify, tamper, expiry
- `convex/*.test.ts` using `convex-test` for the mutation rules
- Test script in `package.json` if it is not already there (`vitest`)

Do not add Playwright in this commit unless the unit and Convex tests are already done and a browser smoke is cheap. Browser coverage for this event is a manual pass on Safari iOS and Chrome Android, listed below.

## Pure tests

Question text:

- Trims and accepts 3–280 characters
- Rejects 2 characters and 281
- Strips `<` and `>`

Word text:

- The four examples in commit 10
- Rejects `FI Group`, empty string, and 31 characters
- Does not turn `inovação` into `inovacao`

Session token:

- A freshly signed token verifies
- A flipped signature fails
- An expired `exp` fails

## Convex tests

Questions:

- Insert succeeds when the speaker is `OPEN`
- Second insert for the same speaker and device fails
- A different speaker succeeds for the same device
- `VOTING` and `FINISHED` reject submit
- `listBySpeaker` omits `hidden` and omits `deviceId`, and sets `isMine` only for the matching device

Votes:

- Cast once, second cast does not duplicate
- Remove deletes it
- Cast fails for a hidden question
- Cast fails when the session is `FINISHED`
- Cast succeeds when the session is `VOTING`

Words:

- First insert stores display and normalized forms
- Second insert for the device fails
- `cloud` counts `Inovação` and `inovação` together and uses the earlier display spelling

Admin:

- `setQuestionStatus`, `setSessionStatus`, and `setAfterUnlocked` throw without a valid token
- They succeed with a valid token
- After unlock, `eventState.get` returns `afterUnlocked: true`

## Manual checklist (write the results in the commit message, not a new doc)

- Two browsers: question appears on both without refresh
- Hide on admin removes it on the phone
- Live view rank changes when a vote lands
- Word cloud on `/screen/words` grows
- Unlock After on a phone that is already on `/after`
- Slot machine does not request images before unlock
- Passphrase is not in the repo (`git grep` for the real value)

Device matrix, manual: iPhone Safari and Android Chrome. Network: a throttled 4G run of home, submit, and vote. If those devices are not available in this environment, say that explicitly. Do not claim they passed.

## Done when

- `npm test` passes
- `npm run build` still passes
- The commit message states which manual checks ran and which did not

## Do not

- Add analytics to “prove” usage
- Change product rules to make a test easier
- Weaken `assertSession` so tests can call admin mutations without a token. Tests should sign a token with the test secret.
