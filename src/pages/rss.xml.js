import rss from '@astrojs/rss';
import { render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { SITE } from '../lib/site';
import { getPosts } from '../lib/posts';

export async function GET(context) {
  const posts = await getPosts();
  const container = await AstroContainer.create();
  const items = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const content = await container.renderToString(Content);
    items.push({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/posts/${post.id}`,
      categories: post.data.tags,
      content,
    });
  }
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items,
    customData: '<language>en-gb</language>',
  });
}
