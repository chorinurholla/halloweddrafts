import { getCollection, type CollectionEntry } from 'astro:content';
import { TOPIC_ORDER, type TopicKey } from './site';

type Entry = CollectionEntry<'posts'>;
/** A post that is ready to publish: every required field is present. */
export type Post = Omit<Entry, 'data'> & {
  data: Entry['data'] & { title: string; date: Date; topic: TopicKey; tags: string[]; excerpt: string };
};

const TAG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
function missing(e: Entry): string[] {
  const d = e.data;
  const m: string[] = [];
  if (!d.title) m.push('title');
  if (!d.date || isNaN(d.date.valueOf())) m.push('date');
  if (!d.topic) m.push('topic');
  if (!d.tags?.length || d.tags.length > 5 || !d.tags.every((t) => TAG_RE.test(t))) m.push('tags');
  if (!d.excerpt) m.push('excerpt');
  return m;
}

let cache: Promise<Post[]> | undefined;
const warned = new Set<string>();

/**
 * Published posts, newest first. Drafts are left out, and so are posts still waiting for the
 * AI tagging Action (missing title, date, topic, tags or excerpt) — those are named in the
 * build log so they are easy to spot, and never stop the rest of the site from publishing.
 */
export function getPosts(): Promise<Post[]> {
  cache ??= getCollection('posts').then((all) => {
    const ready: Post[] = [];
    for (const e of all) {
      if (e.data.draft) continue;
      const m = missing(e);
      if (m.length) {
        if (!warned.has(e.id)) {
          warned.add(e.id);
          console.warn(`[hallowed-drafts] Skipping "${e.filePath ?? e.id}" until it is tagged (missing: ${m.join(', ')}).`);
        }
        continue;
      }
      ready.push(e as Post);
    }
    return ready.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  });
  return cache;
}

export function readingMinutes(post: Post): number {
  const words = (post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
export const formatDate = (d: Date) => dateFmt.format(d).replace('Sept', 'Sep');
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Topics that have at least one post, in display order. */
export function liveTopics(posts: Post[]): TopicKey[] {
  return TOPIC_ORDER.filter((t) => posts.some((p) => p.data.topic === t));
}

export function tagCounts(posts: Post[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

/** Previous (older) and next (newer) post within the same topic. */
export function neighbours(posts: Post[], post: Post) {
  const same = posts.filter((p) => p.data.topic === post.data.topic);
  const i = same.findIndex((p) => p.id === post.id);
  return { newer: i > 0 ? same[i - 1] : undefined, older: i < same.length - 1 ? same[i + 1] : undefined };
}

/** Up to 3 related posts: 2 points per shared tag, 1 for same topic, ties to newest. */
export function related(posts: Post[], post: Post, exclude: string[]): Post[] {
  return posts
    .filter((p) => p.id !== post.id && !exclude.includes(p.id))
    .map((p) => ({
      p,
      score:
        p.data.tags.filter((t) => post.data.tags.includes(t)).length * 2 +
        (p.data.topic === post.data.topic ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.p.data.date.valueOf() - a.p.data.date.valueOf())
    .slice(0, 3)
    .map((x) => x.p);
}

export function paginate<T>(items: T[], size: number) {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages.length ? pages : [[]];
}

/** Curly apostrophes and quotes for titles and excerpts typed with straight ones. */
export const smart = (s: string) =>
  s.replace(/(\w)'(\w)/g, '$1’$2').replace(/"([^"]+)"/g, '“$1”').replace(/(^|\s)'/g, '$1‘').replace(/'/g, '’');
