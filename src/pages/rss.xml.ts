import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getArticles, getParametres } from '../lib/sanity';

export async function GET(context: APIContext) {
  const [articles, params] = await Promise.all([getArticles(30), getParametres()]);
  return rss({
    title: `Actualités – ${params?.nom ?? 'Le Sou des écoles de Boëge'}`,
    description: params?.description ?? 'Les nouvelles du Sou des écoles de Boëge.',
    site: context.site!,
    items: articles.map((a) => ({
      title: a.titre,
      pubDate: new Date(a.date),
      link: `/actualites/${a.slug}`,
      ...(a.resume ? { description: a.resume } : {}),
    })),
    customData: '<language>fr-fr</language>',
  });
}
