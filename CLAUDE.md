# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev            # dev server on :3000
npm run build          # production build
npm run lint           # ESLint (next/core-web-vitals + next/typescript)
npx tsc --noEmit       # typecheck
npm run upload-resume  # push private/resume.pdf to Vercel Blob, prints RESUME_BLOB_PATHNAME
```

There are no tests. `npm run lint` and `npx tsc --noEmit` are the checks — both are currently
clean, so keep them that way.

Formatting is Prettier with `.prettierrc.json`: no semicolons, single quotes, 2-space indent,
80-col, trailing commas, plus `prettier-plugin-tailwindcss` for class sorting. It is deliberately
not wired into ESLint, so nothing enforces it automatically — match the style by hand.

## Architecture

Next.js 15 App Router + React 19 + Tailwind **v4** + TypeScript, deployed on Vercel. `@/*` maps to
the repo root.

### Content lives in `app/data.ts`

This is the single source of truth for everything visible on the site: `HERO`, `HERO_LINKS`,
`ABOUT`, `PROJECTS`, `TIMELINE`, `FOOTER_SOCIAL_LINKS`, `BLOG_ENABLED`/`BLOG_POSTS`. Copy changes,
new projects, and reordering are all edits to this file — not to components.

`Project` is a **discriminated union on `kind`** (`'engineering' | 'founder' | 'design'`). All three
share `ProjectBase` (slug, title, tagline, tags, year, `thumbnail`, optional `hero`, `sections`);
`kind` only decides the surrounding metadata — which links exist and whether the meta strip shows a
stack or a role. Two helpers in the same file flatten that difference so pages stay kind-agnostic:

- `getProjectLinks(project)` → ordered `{label, href}` rows from each kind's own `links` shape.
- `getProjectMeta(project)` → the Year + Stack/Role rows.

Adding a fourth kind means extending the union and both helpers; the homepage card and case-study
page should not need to change.

`Media` is also a union (`image` | `video`), rendered everywhere through
`components/project-media.tsx`, which autoplays muted/looping video and falls back to `poster` when
the visitor prefers reduced motion. Project assets live under `public/projects/<slug>/`.

### Routes

- `app/page.tsx` — the whole homepage, a single `'use client'` file (hero / about / projects /
  timeline / contact). Sections use `motion` scroll reveals from `lib/motion.ts`.
- `app/projects/[slug]/page.tsx` — server component, statically generated via
  `generateStaticParams()` over `PROJECTS`, renders `project.sections` generically.
- `app/resume/page.tsx` — email-gated resume request, `noindex`.
- `app/api/email/route.ts` — one POST endpoint handling both `type: 'contact'` and `type: 'resume'`
  via Resend. The resume PDF comes from Vercel Blob when `RESUME_BLOB_PATHNAME` is set, otherwise
  from the local `RESUME_PDF_PATH` (`private/resume.pdf`, gitignored). Missing env → 500 with
  "Email is not configured yet."
- `app/blog/*` — MDX pages, styled by `app/blog/layout.tsx`. Currently dormant: `BLOG_ENABLED` is
  `false` and `BLOG_POSTS` is empty, so nothing links to them.
- `app/sitemap.ts` / `app/robots.ts` derive from `PROJECTS` and `WEBSITE_URL` (`lib/constants.ts`).

### Layout and theming

The root layout deliberately has **no width cap** — each page wraps its own content in
`components/container.tsx` (`max-w-3xl`) so the homepage hero can run full-bleed. Don't add a
container to the layout.

Theme is `next-themes` with `attribute="class"`, defaulting to dark. Colors are CSS custom
properties in `app/globals.css`: `--theme-*` values under `:root` / `.dark`, exposed to Tailwind as
`bg-background`, `text-muted`, `text-accent`, `border-border`, etc. through the `@theme` block. Edit
palette hex values there only — Tailwind v4 has no `tailwind.config.js`. Note `app/blog/layout.tsx`
predates this and still uses raw `zinc`/`gray` utilities.

Motion is opt-out-aware throughout: components read `useReducedMotion()` and `lib/motion.ts`
returns no-op variants when it's set. Keep that pattern when adding animation. Animated primitives
live in `components/ui/` (spotlight, magnetic, text-effect, morphing-dialog, …) and come from the
motion-primitives template this site was forked from.

## Environment

Copy `.env.example` → `.env.local`. `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `RESEND_FROM_EMAIL`
are required for either form to work; `BLOB_READ_WRITE_TOKEN` is only needed to run
`upload-resume`.

`INSTALLATION.md` is leftover from the upstream `ibelick/nim` template and describes that project,
not this one.
