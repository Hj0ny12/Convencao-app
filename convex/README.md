# Convex database

The Convex project is **not linked**. There is no deployment URL, no deploy key, and no `.env.local`.

Convex does not use SQL migration files. `schema.ts` is the database. When a project is linked later, `npx convex dev` creates the tables and indexes from that file and generates `convex/_generated`. Do not create `_generated` by hand.

## Tables

| Table | Purpose |
| --- | --- |
| `speakers` | Three speakers and session status (`OPEN`, `VOTING`, `FINISHED`) |
| `questions` | One question per device per speaker |
| `votes` | One vote per device per question |
| `words` | One word per device |
| `eventState` | Single row, `afterUnlocked` |

Initial data is not a migration. After the first successful `npx convex dev`, run the idempotent mutations `speakers.seed` and `eventState.ensure`. Running them twice does not insert duplicates.

`questions`, `votes`, and `words` have no mutations yet. Later commits add those rules. Do not add them here.
