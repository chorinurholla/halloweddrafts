// Read counter for Hallowed Drafts.
// POST /api/views {"slug":"..."} adds one read. GET /api/views returns all counts and the total.
// Counts live in Netlify Blobs (store "views"), one key per post. Production-ready for a small blog;
// two reads landing in the same instant can occasionally count as one.
import { getStore } from '@netlify/blobs';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BOT = /bot|crawl|spider|slurp|preview|headless|facebookexternalhit|whatsapp|telegram/i;

const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extra },
  });

export default async (req) => {
  const store = getStore({ name: 'views', consistency: 'strong' });

  if (req.method === 'GET') {
    const { blobs } = await store.list();
    const counts = {};
    let total = 0;
    await Promise.all(
      blobs.map(async ({ key }) => {
        const n = Number(await store.get(key)) || 0;
        counts[key] = n;
        total += n;
      }),
    );
    return json({ counts, total }, 200, { 'cache-control': 'public, max-age=60' });
  }

  if (req.method === 'POST') {
    if (BOT.test(req.headers.get('user-agent') || '')) return new Response(null, { status: 204 });
    let slug;
    try {
      ({ slug } = await req.json());
    } catch {
      return json({ error: 'Invalid body' }, 400);
    }
    if (typeof slug !== 'string' || !SLUG.test(slug) || slug.length > 120) {
      return json({ error: 'Invalid slug' }, 400);
    }
    // Only count posts that actually exist on the site.
    const origin = new URL(req.url).origin;
    const exists = await fetch(`${origin}/posts/${slug}`, { method: 'HEAD' }).then((r) => r.ok).catch(() => false);
    if (!exists) return json({ error: 'Unknown post' }, 404);

    const current = Number(await store.get(slug)) || 0;
    await store.set(slug, String(current + 1));
    return json({ slug, count: current + 1 });
  }

  return json({ error: 'Method not allowed' }, 405, { allow: 'GET, POST' });
};

export const config = { path: '/api/views' };
