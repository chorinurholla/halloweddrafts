import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Posts live in /posts as Markdown. The file name becomes the URL: /posts/<file-name>.
// topic, tags and excerpt are filled in by the AI tagging Action when left out;
// the build refuses a post without them, so an untagged post never goes live.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './posts' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    topic: z.enum(['prayer', 'work', 'inner-life', 'ideas']),
    tags: z
      .array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Tags must be lowercase-hyphenated'))
      .min(1)
      .max(5),
    excerpt: z.string().min(1),
    translation: z.string().optional(),
    translationNote: z.string().optional(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { posts };
