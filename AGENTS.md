# Repository Guidelines

## Project Structure & Module Organization

This Next.js 13 LMS uses the App Router and TypeScript. Pages live in `app/` and API handlers in `app/api/`. Keep route-specific UI in nearby `_components/` directories and reusable UI in `components/`, including shadcn primitives in `components/ui/`. Server queries belong in `actions/`, shared integrations in `lib/`, hooks in `hooks/`, and static files in `public/`. Prisma models live in `prisma/schema.prisma`.

## Build, Test, and Development Commands

- `npm install`: install dependencies and generate the Prisma client through `postinstall`.
- `npm run dev`: start the local Next.js server. Run only when explicitly requested.
- `npm run lint`: apply Next.js Core Web Vitals lint checks.
- `npm run build`: create a production build. Run only when explicitly requested.
- `npx prisma generate`: regenerate the client after schema changes.
- `npx prisma db push`: synchronize the development database; confirm the target database first.

## Coding Style & Naming Conventions

Use strict TypeScript, two-space indentation, double quotes, semicolons, and the `@/` import alias. Name components and exported types in PascalCase, variables in camelCase, and files in kebab-case, for example `course-progress.tsx`. Follow App Router names such as `page.tsx`, `layout.tsx`, and `route.ts`. Add `"use client"` only for browser APIs, state, or event handlers. ESLint extends `next/core-web-vitals`; no formatter is configured.

## Testing Guidelines

No test runner or coverage threshold is configured. Before submitting, run `npm run lint` and manually verify the affected student, teacher, authentication, upload, or checkout path. When adding tests, colocate `*.test.ts` or `*.test.tsx` files with the module and add a script to `package.json`.

## Commit & Pull Request Guidelines

History mainly uses numbered milestones such as `36: analytics`. Continue that form only for tutorial milestones; otherwise use a specific imperative subject and avoid `final`. Pull requests should explain behavior, configuration or schema impact, validation, and linked issues. Include screenshots for UI changes and call out new environment variables or migration steps.

## Security & Agent-Specific Rules

Never commit `.env` files or credentials for Clerk, Stripe, Mux, UploadThing, or the database. Do not run development servers or production builds unless explicitly requested. Write user-facing copy in natural, correctly accented Spanish; keep it concise, product-ready, and free of invented metrics or placeholder claims.
