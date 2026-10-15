import type { APIRoute } from 'astro';
import { getEvenementsAVenir, getEvenementsPasses, getParametres, debutAnneeScolaire } from '../lib/sanity';
import { calendrierIcs, reponseIcs } from '../lib/ics';

/** Tout l'agenda de l'année scolaire, à télécharger ou à suivre par abonnement. */
export const GET: APIRoute = async ({ site }) => {
  const [aVenir, passes, params] = await Promise.all([getEvenementsAVenir(), getEvenementsPasses(debutAnneeScolaire()), getParametres()]);
  const nom = params?.nom ?? 'Le Sou des écoles de Boëge';
  return reponseIcs(calendrierIcs([...passes.reverse(), ...aVenir], site ?? new URL('https://lesoudeboege.fr'), nom), 'agenda-sou-boege.ics');
};
