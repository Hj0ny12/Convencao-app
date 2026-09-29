# Convex database

Convex does not use SQL migration files. `schema.ts` is the database. `npx convex dev` pushes it and refreshes `convex/_generated`.

The dev deployment is selected in `.env.local`, which is gitignored. Do not commit that file or a deploy key.

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
