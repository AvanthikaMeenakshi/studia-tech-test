# Studia Full-Stack Engineering Test

**Time limit: 45 minutes**

## Overview

Studia is building a platform where students subscribe to tutors for livestreamed lessons. In this test, you'll implement the core booking logic for our tutor session system.

You'll work across the stack: writing tRPC procedures that query a Prisma/SQLite database, and building React components that consume them.

## What you need to do

### Part 1: Backend — tRPC Session Router (primary focus)

Open `src/server/routers/session.ts`. You'll find four procedures stubbed out with `throw new Error("Not implemented")`. Implement all four:

1. **`getAvailableSessions`** — Fetch a tutor's upcoming sessions that still have open spots
2. **`bookSession`** — Book a student into a session, with proper validation
3. **`cancelBooking`** — Cancel an existing booking (soft delete — set status, don't remove)
4. **`getStudentBookings`** — Retrieve a student's bookings with session and tutor details

Each procedure has detailed requirements in its JSDoc comment. Read them carefully — the edge cases matter.

### Part 2: Frontend — React Components (secondary focus)

1. **`src/components/SessionCard.tsx`** — A card component displaying a session with a booking button
2. **`src/pages/sessions/[tutorId].tsx`** — A page that lists available sessions and handles booking

We are **not** judging visual design. We're looking at TypeScript quality, state management, and how you handle loading/error states.

## Getting started

```bash
# Install dependencies
npm install

# Setup local ENV
cp .env.example .env

# Set up the database (push schema + seed data)
npm run db:setup

# Run the dev server
npm run dev

# Run tests (this is how we assess Part 1)
npm test
```

## How we'll evaluate

Your work is assessed by running `npm test`. All 19 tests should pass for full marks on Part 1.

For Part 2, we'll review the code manually — looking at component structure, TypeScript usage, and how you handle the booking flow.

## What's provided for you

- Prisma schema and seed data (`prisma/`)
- tRPC initialisation and root router (`src/server/trpc.ts`, `src/server/routers/_app.ts`)
- Database client (`src/server/db.ts`)
- tRPC client utilities (`src/utils/trpc.ts`)
- Next.js API handler (`src/pages/api/trpc/[trpc].ts`)
- Landing page (`src/pages/index.tsx`)
- Complete test suite (`__tests__/`)

## What you should NOT do

- Do not modify the test files
- Do not modify the Prisma schema
- Do not modify the provided server scaffolding (trpc.ts, db.ts, _app.ts)
- Do not add additional npm packages (everything you need is already installed)

## Tech stack

- **Next.js 14** with TypeScript
- **tRPC v10** for type-safe APIs
- **Prisma** with SQLite
- **Zod** for input validation
- **Vitest** for testing
- **React 18**

## Tips

- Start with the backend procedures — they're the bulk of the marks
- Run `npm test` frequently to check your progress
- The seed data is designed to test edge cases: past sessions, full sessions, cancelled bookings
- The `@@unique([studentId, sessionId])` constraint in the schema is relevant to the re-booking requirement
- You can use `npx prisma studio` to inspect the database visually

Good luck.
