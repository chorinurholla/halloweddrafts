# Hallowed Drafts

halloweddrafts.com — a personal journal. Astro static site on Netlify, with search (Pagefind), read counts (a Netlify Function + Netlify Blobs), light/dark themes and AI tagging (a GitHub Action calling Claude).

## Publishing a post

**Simplest way:** upload the post exactly as you export it (for example `What Actually Matters — Blog Post.md`, starting with `# Title — Blog Post` and a `Sep 11, 2026 · @Tolu` line) into the `posts/` folder on GitHub.

Within about two minutes the **AI tagging** Action:

1. tidies it: adds the title and date, renames the file to a clean web address (`/posts/what-actually-matters`) and switches to British spelling outside quoted Scripture;
2. tags it: Claude adds `topic`, `tags`, `excerpt` and `translation`;
3. saves the change, and Netlify publishes the post.

Until that finishes, the site keeps building without the new post, so nothing breaks.

You can also write the settings yourself at the top of the file:

```markdown
---
title: "My New Post"
date: 2026-11-01
---

Your post, in normal Markdown. Use ## for section headings.

---

**A question to sit with this week:**

Anything after the last --- becomes the closing reflection block.
```

The AI never overwrites a field you filled in. To re-tag a post, delete its `tags:` line and push again. Add `draft: true` to keep a post off the site.

Optional fields: `updated: 2026-11-05` (shows "Updated …"), `translationNote: "…"` (replaces the default "Scripture quotations are from the ESV.").

**If tagging fails** (for example the API key is missing or the API is down), the post is tidied but not shown yet. GitHub emails you; fix the cause and re-run the Action from the Actions tab (AI tagging → Run workflow), or fill the fields in by hand. The build log on Netlify names any post it skipped.

## Changing site wording

Tagline, site line, about line, topic intros and read-count thresholds live in `src/lib/site.ts`.

## Going live (one-time)

1. **GitHub:** create a repository (private is fine) and upload everything in this folder, including the hidden `.github` folder.
2. **GitHub secret:** repository → Settings → Secrets and variables → Actions → New repository secret: `ANTHROPIC_API_KEY` = your Anthropic API key (from console.anthropic.com). Optional variable `ANTHROPIC_MODEL` to change the model.
3. **Netlify:** Add new site → Import an existing project → GitHub → choose the repository. Settings come from `netlify.toml`; just press Deploy.
4. **Domain:** Netlify → Domain management → Add a domain → `halloweddrafts.com`. Either switch the domain's nameservers to Netlify DNS, or add the A / CNAME records Netlify shows at your registrar. HTTPS is issued automatically.
5. **Netlify Blobs** (read counts) needs no setup; it is enabled for every Netlify site.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321 (search and read counts need a full build / Netlify)
npm run build    # builds to dist/ and indexes search
```

Read counts only work on Netlify (or `netlify dev`); locally the site shows dates and reading times without them.

## What's where

| Path | Purpose |
| --- | --- |
| `posts/` | The writing |
| `src/lib/site.ts` | Site wording and settings |
| `src/styles/global.css` | All styles and design tokens (light and dark) |
| `src/pages/` | Home, Popular, topic, tag, post, search, 404, RSS |
| `public/js/site.js` | Theme toggle, search overlay, read counts |
| `netlify/functions/views.mjs` | Read counter (`/api/views`) |
| `scripts/ai-tag.mjs` + `.github/workflows/ai-tag.yml` | AI tagging |
