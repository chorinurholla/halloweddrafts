# Hallowed Drafts

halloweddrafts.com — a personal journal. Astro static site on Netlify, with search (Pagefind), read counts (a Netlify Function + Netlify Blobs), light/dark themes and AI tagging (a GitHub Action calling Claude).

## Publishing a post

1. Add a Markdown file to `posts/`. The file name becomes the URL: `posts/my-new-post.md` → `/posts/my-new-post`.
2. Start it with:

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

3. Push (or upload) it to GitHub. The **AI tagging** Action adds `topic`, `tags`, `excerpt` and `translation`, saves the change, and Netlify publishes. Allow about two minutes.

You can write any of those fields yourself; the AI never overwrites them. To re-tag a post, delete its `tags:` line and push again. Add `draft: true` to keep a post off the site.

Optional fields: `updated: 2026-11-05` (shows "Updated …"), `translationNote: "…"` (replaces the default "Scripture quotations are from the ESV.").

**If tagging fails** (for example the API is down), the post simply isn't published yet: the build refuses posts without a topic, tags and excerpt, and the live site stays as it was. GitHub emails you; re-run the Action from the Actions tab or fill the fields in by hand.

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
