import { defineField, defineType } from 'sanity';

export const partenaire = defineType({
  name: 'partenaire',
  title: 'Partenaire',
  type: 'document',
  fields: [
    defineField({ name: 'nom', title: 'Nom', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'logo', title: 'Logo', type: 'image' }),
    defineField({ name: 'url', title: 'Site web', type: 'url' }),
    defineField({ name: 'description', title: 'Description courte', type: 'text', rows: 2 }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10 }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'url', media: 'logo' } },
});
