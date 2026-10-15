/** Génération de fichiers iCalendar (.ics) à partir des événements Sanity. */
import type { Evenement } from './sanity';
import { estJourneeEntiere } from './sanity';

const TZ = 'Europe/Paris';
const pad = (n: number) => String(n).padStart(2, '0');
const dateLocale = (iso: string) => {
  const parts = new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ }).formatToParts(new Date(iso));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${g('year')}${g('month')}${g('day')}`;
};
const dateUtc = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
const lendemain = (yyyymmdd: string) => {
  const d = new Date(Date.UTC(+yyyymmdd.slice(0, 4), +yyyymmdd.slice(4, 6) - 1, +yyyymmdd.slice(6, 8) + 1));
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
};
const echapper = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
/** Plie les lignes à 75 octets comme l'exige la RFC 5545. */
const plier = (ligne: string) => {
  const out: string[] = [];
  let reste = ligne;
  while (Buffer.byteLength(reste) > 75) {
    let coupe = 75;
    while (Buffer.byteLength(reste.slice(0, coupe)) > 75) coupe--;
    out.push(reste.slice(0, coupe));
    reste = ' ' + reste.slice(coupe);
  }
  out.push(reste);
  return out.join('\r\n');
};

export const evenementVersIcs = (ev: Evenement, site: URL, domaine: string) => {
  const url = ev.lien ?? new URL(ev.article ? `/actualites/${ev.article.slug}` : '/agenda', site).href;
  const lignes = ['BEGIN:VEVENT', `UID:${ev._id}@${domaine}`, `DTSTAMP:${dateUtc(new Date())}`];
  if (estJourneeEntiere(ev.debut)) {
    const j = dateLocale(ev.debut);
    lignes.push(`DTSTART;VALUE=DATE:${j}`, `DTEND;VALUE=DATE:${lendemain(ev.fin ? dateLocale(ev.fin) : j)}`);
  } else {
    const debut = new Date(ev.debut);
    const fin = ev.fin ? new Date(ev.fin) : new Date(debut.getTime() + 2 * 3600 * 1000);
    lignes.push(`DTSTART:${dateUtc(debut)}`, `DTEND:${dateUtc(fin)}`);
  }
  lignes.push(`SUMMARY:${echapper(ev.previsionnel ? `${ev.titre} (date à confirmer)` : ev.titre)}`);
  if (ev.lieu) lignes.push(`LOCATION:${echapper(ev.lieu)}`);
  const desc = [ev.description, url].filter(Boolean).join('\n');
  if (desc) lignes.push(`DESCRIPTION:${echapper(desc)}`);
  lignes.push(`URL:${url}`, 'END:VEVENT');
  return lignes.map(plier).join('\r\n');
};

export const calendrierIcs = (evenements: Evenement[], site: URL, nom: string) => {
  const domaine = site.hostname;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${nom}//Agenda//FR`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    plier(`X-WR-CALNAME:${echapper(nom)}`),
    'X-WR-TIMEZONE:Europe/Paris',
    ...evenements.map((ev) => evenementVersIcs(ev, site, domaine)),
    'END:VCALENDAR',
    '',
  ].join('\r\n');
};

export const reponseIcs = (corps: string, nomFichier: string) =>
  new Response(corps, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomFichier}"`,
    },
  });
