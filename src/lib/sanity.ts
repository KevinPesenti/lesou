import { sanityClient } from 'sanity:client';
import { createImageUrlBuilder } from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const client = sanityClient;
const builder = createImageUrlBuilder(sanityClient);

export const urlFor = (source: SanityImageSource) => builder.image(source).auto('format');

/* ---------- Types ---------- */
export interface SanityImage {
  asset?: { _id: string; url: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } };
  alt?: string;
  legende?: string;
  hotspot?: unknown;
  crop?: unknown;
}
export interface SanityFile {
  _key?: string;
  titre?: string;
  asset?: { url: string; originalFilename?: string; size?: number; extension?: string };
}
export interface Cotisation {
  montantUnEnfant?: number;
  montantParEnfantSuivant?: number;
  accroche?: string;
  texte?: string;
  utilisations?: string[];
  bulletin?: SanityFile;
}
export interface ContactUtile {
  _id: string;
  nom: string;
  sousTitre?: string;
  icone?: string;
  telephones?: string[];
  email?: string;
  site?: string;
  adresse?: string;
  horaires?: string;
}
export interface Annonce { actif?: boolean; texte?: string; ton?: 'info' | 'alerte' | 'bonne'; lien?: string; libelleLien?: string }
export interface Parametres {
  nom?: string;
  annonce?: Annonce;
  rendezVous?: Evenement | null;
  cotisation?: Cotisation;
  accroche?: string;
  description?: string;
  email?: string;
  facebook?: string;
  helloasso?: string;
  adresse?: string;
  anneeScolaire?: string;
}
export interface MenuPage { titre: string; slug: string }
export interface ArticleCard {
  titre: string;
  slug: string;
  date: string;
  resume?: string;
  image?: SanityImage;
}
export interface Article extends ArticleCard {
  corps?: unknown[];
  piecesJointes?: SanityFile[];
}
export interface Page {
  titre: string;
  slug: string;
  intro?: string;
  corps?: unknown[];
}
export interface Evenement {
  _id: string;
  titre: string;
  debut: string;
  fin?: string;
  lieu?: string;
  previsionnel?: boolean;
  description?: string;
  lien?: string;
  article?: { titre: string; slug: string };
}
export interface Membre { nom: string; role: string; photo?: SanityImage }
export interface Partenaire { nom: string; logo?: SanityImage; url?: string; description?: string }

/* ---------- Fragments GROQ ---------- */
const IMAGE = `{ ..., asset->{ _id, url, metadata{ lqip, dimensions } } }`;
const FILE = `{ ..., asset->{ url, originalFilename, size, extension } }`;
const CORPS = `corps[]{
  ...,
  _type == "image" => ${IMAGE},
  _type == "fichier" => ${FILE},
  _type == "galerie" => { ..., images[] ${IMAGE} }
}`;

const EVENEMENT = `_id, titre, debut, fin, lieu, previsionnel, description, lien, article->{ titre, "slug": slug.current }`;

/* ---------- Requêtes ---------- */
export const getParametres = () =>
  client.fetch<Parametres | null>(
    `*[_type == "parametres"][0]{ ..., cotisation{ ..., bulletin ${FILE} }, rendezVous->{ ${EVENEMENT} } }`,
  );

export const getContacts = () =>
  client.fetch<ContactUtile[]>(`*[_type == "contactUtile"] | order(ordre asc, nom asc){ _id, nom, sousTitre, icone, telephones, email, site, adresse, horaires }`);

export const getMenuPages = () =>
  client.fetch<MenuPage[]>(`*[_type == "page" && dansMenu == true && defined(slug.current)] | order(ordre asc, titre asc){ titre, "slug": slug.current }`);

export const getArticles = (limit?: number) =>
  client.fetch<ArticleCard[]>(
    `*[_type == "article" && defined(slug.current)] | order(date desc) ${limit ? `[0...${limit}]` : ''}{
      titre, "slug": slug.current, date, resume,
      "image": coalesce(image, corps[_type == "image"][0]) ${IMAGE}
    }`,
  );

export const getArticle = (slug: string) =>
  client.fetch<Article | null>(
    `*[_type == "article" && slug.current == $slug][0]{
      titre, "slug": slug.current, date, resume, image ${IMAGE}, ${CORPS}, piecesJointes[] ${FILE}
    }`,
    { slug },
  );

export const getPages = () =>
  client.fetch<Page[]>(`*[_type == "page" && defined(slug.current)]{ titre, "slug": slug.current, intro, ${CORPS} }`);

export const getEvenementsAVenir = (limit?: number) =>
  client.fetch<Evenement[]>(
    `*[_type == "evenement" && coalesce(fin, debut) >= now()] | order(debut asc) ${limit ? `[0...${limit}]` : ''}{
      ${EVENEMENT}
    }`,
  );

export const getEvenementsPasses = (depuis: string) =>
  client.fetch<Evenement[]>(
    `*[_type == "evenement" && coalesce(fin, debut) < now() && debut >= $depuis] | order(debut desc){
      ${EVENEMENT}
    }`,
    { depuis },
  );

export const getBureau = () =>
  client.fetch<Membre[]>(`*[_type == "membreBureau"] | order(ordre asc, nom asc){ nom, role, photo ${IMAGE} }`);

export const getPartenaires = () =>
  client.fetch<Partenaire[]>(`*[_type == "partenaire"] | order(ordre asc, nom asc){ nom, logo ${IMAGE}, url, description }`);

/* ---------- Dates ---------- */
const TZ = 'Europe/Paris';
export const dateLongue = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: TZ }).format(new Date(iso));
export const dateCourte = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: TZ }).format(new Date(iso));
export const jourNumero = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: TZ }).format(new Date(iso));
export const moisCourt = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: TZ }).format(new Date(iso)).replace('.', '');
export const heure = (iso: string) => {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', minute: '2-digit', timeZone: TZ }).formatToParts(d);
  const h = parts.find((p) => p.type === 'hour')?.value ?? '';
  const m = parts.find((p) => p.type === 'minute')?.value ?? '00';
  return m === '00' ? `${h}h` : `${h}h${m}`;
};
/** Un événement saisi à minuit pile (heure de Paris) est une journée entière. */
export const estJourneeEntiere = (iso: string) => heure(iso) === '0h';
/** « vendredi 14 novembre à 19h » ; omet l'heure si l'événement est à minuit pile (journée entière). */
export const quandEvenement = (ev: Evenement) => {
  const d = new Date(ev.debut);
  const jour = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(d);
  const h = heure(ev.debut);
  const journeeEntiere = h === '0h';
  return journeeEntiere ? jour : `${jour} à ${h}`;
};
/** Début de l'année scolaire en cours (1er août). */
export const debutAnneeScolaire = () => {
  const now = new Date();
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-08-01`;
};
/** Année scolaire d'une date ISO, sous la forme « 2025-2026 » (bascule au 1er août). */
export const anneeScolaireDe = (iso: string) => {
  const d = new Date(iso);
  const year = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  return `${year}-${year + 1}`;
};
export const tailleFichier = (octets?: number) => {
  if (!octets) return '';
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
};
