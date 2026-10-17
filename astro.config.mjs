import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import rehypeReflection from './src/lib/rehype-reflection.mjs';

// Tags with fewer than 2 posts, or named the same as a topic, are left out of the sitemap
// (and marked noindex on the page) so search engines don't see thin or duplicate pages.
const TOPIC_KEYS = ['prayer', 'work', 'inner-life', 'ideas'];
const tagCounts = {};
for (const f of readdirSync('./posts').filter((f) => f.endsWith('.md'))) {
  const m = readFileSync(`./posts/${f}`, 'utf8').match(/^tags:\s*\[(.*)\]\s*$/m);
  if (!m) continue;
  for (const t of m[1].split(',').map((s) => s.trim().replace(/["']/g, '')).filter(Boolean))
    tagCounts[t] = (tagCounts[t] || 0) + 1;
}
const indexableTag = (t) => (tagCounts[t] || 0) >= 2 && !TOPIC_KEYS.includes(t);

export default defineConfig({
  site: 'https://halloweddrafts.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  markdown: {
    rehypePlugins: [rehypeReflection],
    smartypants: true,
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/$/, '');
        if (path === '/popular' || path === '/search' || path.includes('/page/')) return false;
        const tag = path.match(/^\/tags\/(.+)$/);
        if (tag) return indexableTag(decodeURIComponent(tag[1]));
        return true;
      },
    }),
  ],
});
