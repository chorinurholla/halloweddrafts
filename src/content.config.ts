import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts live in /posts as Markdown. The file name becomes the URL: /posts/<file-name>.
//
// Every field is optional here on purpose: a post that has just been uploaded (and not yet
// tidied and tagged by the AI tagging Action) must never break the whole site. Posts missing
// a title, date, topic, tags or excerpt are skipped by getPosts() with a warning in the build
// log, and appear on the site automatically once the Action has filled them in.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './posts' }),
  schema: z.object({
    title: z.string().min(1).optional(),
    date: z.coerce.date().optional().catch(undefined),
    topic: z.enum(['prayer', 'work', 'inner-life', 'ideas']).optional().catch(undefined),
    tags: z.array(z.string()).optional().catch(undefined),
    excerpt: z.string().min(1).optional(),
    translation: z.string().optional(),
    translationNote: z.string().optional(),
    updated: z.coerce.date().optional().catch(undefined),
    draft: z.boolean().optional(),
  }),
});

export const collections = { posts };
