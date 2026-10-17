import { getCollection, type CollectionEntry } from 'astro:content';
import { TOPIC_ORDER, type TopicKey } from './site';

export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
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
