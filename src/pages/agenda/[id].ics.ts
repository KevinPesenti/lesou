import type { APIRoute, GetStaticPaths } from 'astro';
import { getEvenementsAVenir, getEvenementsPasses, getParametres, debutAnneeScolaire } from '../../lib/sanity';
import { calendrierIcs, reponseIcs } from '../../lib/ics';

/** Un seul événement, pour le bouton « Ajouter à mon calendrier ». */
export const getStaticPaths: GetStaticPaths = async () => {
  const [aVenir, passes] = await Promise.all([getEvenementsAVenir(), getEvenementsPasses(debutAnneeScolaire())]);
  return [...aVenir, ...passes].map((ev) => ({ params: { id: ev._id }, props: { ev } }));
};
export const GET: APIRoute = async ({ props, site }) => {
  const params = await getParametres();
  const nom = params?.nom ?? 'Le Sou des écoles de Boëge';
  return reponseIcs(calendrierIcs([props.ev], site ?? new URL('https://lesoudeboege.fr'), nom), `${props.ev._id}.ics`);
};
