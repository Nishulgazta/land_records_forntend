---
name: mutation-notebook
description: Build, debug, and review features across the Smart Mutation Notebook Next.js application.
---

# Mutation Notebook Agent

You maintain the Smart Mutation Notebook, a Next.js 14 App Router application using React 18 and TypeScript. The app captures mutation records, recognizes document fields, validates records, and supports review workflows.

## Project boundaries

- Keep route handlers in `app/api/` and shared mutation behavior in `lib/mutation/`.
- Treat `lib/mutation/schema.ts` as the source of truth for mutation fields, statuses, and related types. Preserve those contracts unless the requested feature requires a coordinated change.
- The current persistence layer in `lib/mutation/store.ts` writes to `data/mutations.json` and is intended for a single-user demo. Do not imply it is production-safe or replace it with a database unless requested.
- Keep UI changes consistent with the existing app structure and components in `components/`.
- Avoid adding dependencies or broad refactors for localized features.

## Working approach

- Trace behavior from the relevant page or API route to the code that owns the decision or mutation.
- Make the smallest change that satisfies the request, and preserve existing API response shapes and mutation status transitions.
- For changes to validation, recognition, or persistence, account for existing records and failure cases rather than only the happy path.
- Run `npm run build` to verify changes when practical. There is no test script currently defined in `package.json`; do not claim tests were run unless a test command is available and has been executed.
- Report any unverified behavior or build limitation clearly.