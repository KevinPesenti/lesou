/**
 * Importe les articles et pages de lesoudeboege.wordpress.com dans Sanity.
 *
 *   node scripts/import-wordpress.mjs            # import complet (idempotent)
 *   node scripts/import-wordpress.mjs --dry-run  # affiche sans écrire
 *
 * Nécessite SANITY_WRITE_TOKEN dans .env (rôle « editor »).
 * Les documents sont créés avec un _id stable (wp-post-<id>, wp-page-<id>),
 * donc relancer le script met à jour au lieu de dupliquer.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@sanity/client';
import { htmlToPortableText } from '@portabletext/html';
import { compileSchema, defineSchema } from '@portabletext/schema';
import { JSDOM } from 'jsdom';

const DRY = process.argv.includes('--dry-run');
const WP = 'https://public-api.wordpress.com/wp/v2/sites/lesoudeboege.wordpress.com';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => l.split('=').map((s) => s.trim())),
);
if (!env.SANITY_WRITE_TOKEN && !DRY) throw new Error('SANITY_WRITE_TOKEN manquant dans .env');

const client = createClient({
  projectId: env.PUBLIC_SANITY_PROJECT_ID || '4lcj5kde',
  dataset: env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-10-01',
  token: env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

/* Schéma minimal pour la conversion HTML -> Portable Text (aligné sur blockContent.ts) */
const schema = compileSchema(
  defineSchema({
    styles: [{ name: 'normal' }, { name: 'h2' }, { name: 'h3' }, { name: 'blockquote' }],
    lists: [{ name: 'bullet' }, { name: 'number' }],
    decorators: [{ name: 'strong' }, { name: 'em' }, { name: 'underline' }],
    annotations: [{ name: 'link', fields: [{ name: 'href', type: 'string' }] }],
    blockObjects: [
      {
        name: 'image',
        fields: [{ name: 'alt', type: 'string' }, { name: 'legende', type: 'string' }],
      },
    ],
  }),
);

/* ---------- Utilitaires ---------- */
const decode = (html) => new JSDOM(`<body>${html}</body>`).window.document.body.textContent.trim();
const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const key = () => Math.random().toString(36).slice(2, 10);

const assetCache = new Map();
async function uploadImage(url, filename) {
  const clean = url.split('?')[0];
  if (assetCache.has(clean)) return assetCache.get(clean);
  if (DRY) { assetCache.set(clean, { _id: 'image-dry' }); return assetCache.get(clean); }
  try {
    const res = await fetch(clean);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload('image', buf, { filename: filename || clean.split('/').pop() });
    assetCache.set(clean, asset);
    return asset;
  } catch (e) {
    console.warn(`  ! image ignorée ${clean} (${e.message})`);
    assetCache.set(clean, null);
    return null;
  }
}

const fileCache = new Map();
async function uploadFile(url) {
  const clean = url.split('?')[0];
  if (fileCache.has(clean)) return fileCache.get(clean);
  if (DRY) { fileCache.set(clean, { url: clean }); return fileCache.get(clean); }
  try {
    const res = await fetch(clean);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const asset = await client.assets.upload('file', buf, { filename: decodeURIComponent(clean.split('/').pop()) });
    fileCache.set(clean, asset);
    console.log(`  + document rapatrié ${asset.originalFilename}`);
    return asset;
  } catch (e) {
    console.warn(`  ! document ignoré ${clean} (${e.message})`);
    fileCache.set(clean, null);
    return null;
  }
}
const DOC_RE = /\.(pdf|docx?|xlsx?|odt|ods|pptx?)$/i;

async function fetchAll(type) {
  const out = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${WP}/${type}?per_page=100&page=${page}&_embed=wp:featuredmedia&status=publish`);
    if (res.status === 400) break; // au-delà de la dernière page
    if (!res.ok) throw new Error(`${type} page ${page}: HTTP ${res.status}`);
    const items = await res.json();
    out.push(...items);
    if (items.length < 100) break;
  }
  return out;
}

/** Convertit le HTML WordPress en Portable Text, en téléversant les images inline. */
async function toPortableText(html) {
  const dom = new JSDOM(`<body>${html}</body>`);
  const doc = dom.window.document;
  // Nettoyage des blocs WordPress inutiles
  doc.querySelectorAll('script, style, .sharedaddy, .jp-relatedposts, .wp-block-jetpack-slideshow, .wp-block-jetpack-event-countdown').forEach((n) => n.remove());
  // Les documents liés (PDF…) hébergés chez WordPress sont rapatriés dans Sanity
  for (const a of [...doc.querySelectorAll('a[href]')]) {
    const href = a.getAttribute('href');
    if (!href || !DOC_RE.test(href.split('?')[0])) continue;
    const asset = await uploadFile(href.startsWith('//') ? `https:${href}` : href);
    if (asset?.url) a.setAttribute('href', asset.url);
  }
  // Les images sont remplacées par un marqueur reconnu par la règle ci-dessous
  const images = [];
  for (const img of [...doc.querySelectorAll('img')]) {
    const src = img.getAttribute('data-orig-file') || img.getAttribute('src');
    if (!src || src.startsWith('data:')) { img.remove(); continue; }
    const fig = img.closest('figure');
    const legende = fig?.querySelector('figcaption')?.textContent?.trim() || '';
    const asset = await uploadImage(src.startsWith('//') ? `https:${src}` : src);
    const marker = doc.createElement('div');
    marker.setAttribute('data-sanity-image', String(images.length));
    images.push({ asset, alt: img.getAttribute('alt') || '', legende });
    (fig ?? img).replaceWith(marker);
  }
  const blocks = htmlToPortableText(doc.body.innerHTML, {
    schema,
    parseHtml: (h) => new JSDOM(h).window.document,
    whitespaceMode: 'remove',
    rules: [
      {
        deserialize(el, next, block) {
          if (el.nodeType !== 1 || !el.hasAttribute?.('data-sanity-image')) return undefined;
          const img = images[Number(el.getAttribute('data-sanity-image'))];
          if (!img?.asset) return undefined;
          return block({
            _type: 'image',
            asset: { _type: 'reference', _ref: img.asset._id },
            alt: img.alt || undefined,
            legende: img.legende || undefined,
          });
        },
      },
    ],
  });
  // Retire les paragraphes vides et donne des clés stables
  return blocks
    .filter((b) => b._type !== 'block' || b.children?.some((c) => c.text?.trim()))
    .map((b) => ({ ...b, _key: b._key || key(), children: b.children?.map((c) => ({ ...c, _key: c._key || key() })) }));
}

/* ---------- Import ---------- */
console.log('Récupération des articles…');
const posts = await fetchAll('posts');
console.log(`${posts.length} articles trouvés`);
const slugs = new Set();

for (const p of posts) {
  const titre = decode(p.title.rendered);
  let slug = p.slug ? decodeURIComponent(p.slug) : slugify(titre);
  slug = slugify(slug);
  if (!slug || /^\d+$/.test(slug)) slug = slugify(titre) || `article-${p.id}`; // slug WordPress numérique
  while (slugs.has(slug)) slug = `${slug}-${p.id}`;
  slugs.add(slug);
  console.log(`- ${p.date.slice(0, 10)}  ${titre}`);

  const featured = p._embedded?.['wp:featuredmedia']?.[0];
  const image = featured?.source_url ? await uploadImage(featured.source_url, featured.slug) : null;
  const corps = await toPortableText(p.content.rendered);
  let resume = decode(p.excerpt?.rendered || '').replace(/\s*\[…\]$/, '').replace(/\s*Lire la suite.*$/i, '').slice(0, 300);
  // L'extrait WordPress est souvent une copie du début du texte : on ne le garde pas dans ce cas
  const debutTexte = corps.filter((b) => b._type === 'block').map((b) => b.children.map((c) => c.text).join('')).join(' ').replace(/\s+/g, ' ').trim();
  if (resume && debutTexte.replace(/\s+/g, ' ').startsWith(resume.replace(/\s+/g, ' ').slice(0, 60))) resume = '';

  const docu = {
    _id: `wp-post-${p.id}`,
    _type: 'article',
    titre,
    slug: { _type: 'slug', current: slug },
    date: new Date(p.date_gmt + 'Z').toISOString(),
    resume: resume || undefined,
    corps,
    ...(image ? { image: { _type: 'image', asset: { _type: 'reference', _ref: image._id }, alt: featured.alt_text || undefined } } : {}),
  };
  if (!DRY) await client.createOrReplace(docu);
}

console.log('\nRécupération des pages…');
const pages = await fetchAll('pages');
const SANS_IMPORT = new Set(['le-sou-des-ecoles', 'ecole']); // pages « conteneur » sans contenu
// Anciens slugs -> nouveaux. Les pages hors menu restent accessibles mais sont remplacées
// par des pages dédiées (/bureau, /partenaires) qu'il faudra alimenter dans le Studio.
const SLUGS = {
  quoi: 'notre-mission',
  qui: 'notre-equipe',
  'les-partenaires-de-lassociation': 'partenaires-ancienne-page',
};
const HORS_MENU = new Set(['mentions-legales', 'notre-equipe', 'partenaires-ancienne-page']);
let ordre = 10;
for (const p of pages) {
  const titre = decode(p.title.rendered);
  const slugWp = slugify(decodeURIComponent(p.slug)) || `page-${p.id}`;
  const slug = SLUGS[slugWp] ?? slugWp;
  if (SANS_IMPORT.has(slugWp)) { console.log(`- (ignorée) ${titre}`); continue; }
  console.log(`- ${titre}  → /${slug}`);
  const corps = await toPortableText(p.content.rendered);
  const docu = {
    _id: `wp-page-${p.id}`,
    _type: 'page',
    titre,
    slug: { _type: 'slug', current: slug },
    dansMenu: !HORS_MENU.has(slug),
    ordre: (ordre += 10),
    corps,
  };
  if (!DRY) await client.createOrReplace(docu);
}

console.log(DRY ? '\nSimulation terminée (rien n’a été écrit).' : '\nImport terminé.');
