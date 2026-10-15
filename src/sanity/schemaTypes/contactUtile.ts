import { defineField, defineType } from 'sanity';

export const ICONES = [
  { title: 'École', value: 'ecole' },
  { title: 'Garderie / centre de loisirs', value: 'garderie' },
  { title: 'Cantine', value: 'cantine' },
  { title: 'Médiathèque', value: 'mediatheque' },
  { title: 'Mairie', value: 'mairie' },
  { title: 'Communauté de communes', value: 'communaute' },
  { title: 'Association', value: 'association' },
  { title: 'Parents d’élèves', value: 'parents' },
  { title: 'Santé / urgences', value: 'sante' },
  { title: 'Autre', value: 'autre' },
];

/** Une fiche du Memento : un numéro utile, un email, un lien. */
export const contactUtile = defineType({
  name: 'contactUtile',
  title: 'Contact utile (Memento)',
  type: 'document',
  fields: [
    defineField({ name: 'nom', title: 'Nom', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'sousTitre', title: 'Précision', description: 'Ex. « Centre de loisirs », « Pour contacter les parents représentants »', type: 'string' }),
    defineField({ name: 'icone', title: 'Icône', type: 'string', options: { list: ICONES, layout: 'dropdown' }, initialValue: 'autre' }),
    defineField({ name: 'telephones', title: 'Téléphones', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'site', title: 'Site web ou page Facebook', type: 'url' }),
    defineField({ name: 'adresse', title: 'Adresse', type: 'text', rows: 2 }),
    defineField({ name: 'horaires', title: 'Horaires', type: 'text', rows: 2 }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10 }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'sousTitre' } },
});
