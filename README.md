# SkinSense — marketing site

Marketing website for **SkinSense**, a free AI skin-screening web app. The app
itself runs on Hugging Face at <https://elisha622-skinsense.hf.space>; every
"Open the app / Analyse my skin / Sign in" button on this site links there.

Built with Next.js 16 (App Router, TypeScript), Tailwind CSS v4, framer-motion
and lucide-react. Fonts are Geist + Geist Mono via `next/font`.

## Pages

| Route      | What it is                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| `/`        | Home: hero slideshow, stats, how it works, conditions (with pop-up guides), example reading, routines + ingredient marquee, before/after explainer, privacy & safety, FAQ teaser, photo gallery with lightbox, CTA |
| `/about`   | Mission, the problem, principles, how the model works, its limits, what's next |
| `/faq`     | Full FAQ with topic tabs and live search (press `/` to focus search)       |
| `/privacy` | Plain-language summary of what is and isn't stored, and how to ask for deletion |
| 404        | Branded not-found page                                                     |

Also generated: `/opengraph-image` (social card), `/icon.svg` (favicon),
`/sitemap.xml`, `/robots.txt`.

## Editing content

**All copy and data live in [`lib/content.ts`](lib/content.ts)** — headlines,
conditions, FAQ, routine steps, privacy text, footer links. Wrap part of a
title in `*asterisks*` to give it the gradient accent. Photos (Unsplash, with
alt text) are listed in [`lib/images.ts`](lib/images.ts).

Please keep the honesty rules noted at the top of `lib/content.ts`: no
testimonials, ratings, user counts, accuracy claims or invented people, and
keep UI previews labelled as illustrative.

## Project structure

```
app/                  routes, layout, metadata files (icon, OG image, sitemap, robots)
components/
  layout/             Navbar (sticky, glass, mobile menu) and Footer
  sections/           home-page sections + FaqExplorer
  ui/                 primitives: Button, Badge, Dialog, Lightbox, Carousel,
                      Accordion, Marquee, Counter, Reveal, TiltCard, Logo, …
  providers/          MotionProvider (respects prefers-reduced-motion)
lib/
  content.ts          all site copy
  images.ts           photo list + URL helpers
  site.ts             APP_URL / SITE_URL + per-page metadata helper
  hooks.ts            focus trap, scroll lock, useIsClient
```

## Environment variables

| Name                   | Default                                  | Purpose                                  |
| ---------------------- | ---------------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_APP_URL`  | `https://elisha622-skinsense.hf.space`   | Target of every app CTA                  |
| `NEXT_PUBLIC_SITE_URL` | Vercel production domain, else `http://localhost:3000` | Canonical URLs, OG, sitemap, robots |

Copy `.env.example` to `.env.local` to override locally. `NEXT_PUBLIC_*`
values are inlined at build time, so redeploy after changing them.

## Run locally

Requires Node.js 20.9+.

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build and lint

```bash
npm run lint
npm run build
npm start          # serve the production build locally
```

## Deploy to Vercel

Option A — Vercel CLI (from this folder):

```bash
npm i -g vercel
vercel login
vercel link                                     # create / link the project
vercel env add NEXT_PUBLIC_APP_URL production   # paste https://elisha622-skinsense.hf.space
vercel --prod
```

Option B — Git: push this repo to GitHub/GitLab/Bitbucket, then in the Vercel
dashboard choose **Add New → Project**, import the repo (framework preset:
Next.js, no build settings to change), add `NEXT_PUBLIC_APP_URL` under
Environment Variables, and deploy.

After adding a custom domain, set `NEXT_PUBLIC_SITE_URL` to it (e.g.
`https://skinsense.example`) and redeploy so canonical/OG URLs use it.

## Notes

- Images are served through `next/image` from `images.unsplash.com`; the allowed
  query strings are pinned in `next.config.ts`.
- This site sets no cookies and has no analytics. If you enable Vercel
  Analytics later, review the wording on `/privacy`.
- Medical disclaimer: SkinSense is an educational screening tool and is not a
  medical device. It does not diagnose, treat or cure any condition.
