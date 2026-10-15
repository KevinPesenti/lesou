import { defineField, defineType } from 'sanity';

export const evenement = defineType({
  name: 'evenement',
  title: 'Événement',
  type: 'document',
  fields: [
    defineField({ name: 'titre', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'debut',
      title: 'Date et heure',
      type: 'datetime',
      options: { timeStep: 15 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'fin', title: 'Fin (facultatif)', type: 'datetime', options: { timeStep: 15 } }),
    defineField({ name: 'lieu', title: 'Lieu', type: 'string' }),
    defineField({
      name: 'previsionnel',
      title: 'Date à confirmer',
      description: 'Affiche une étiquette « date à confirmer » sur le site.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'description', title: 'Description courte', type: 'text', rows: 3 }),
    defineField({
      name: 'lien',
      title: 'Lien (inscription, billetterie HelloAsso…)',
      type: 'url',
    }),
    defineField({
      name: 'article',
      title: 'Article lié',
      description: 'Pour renvoyer vers l’article qui détaille l’événement.',
      type: 'reference',
      to: [{ type: 'article' }],
    }),
  ],
  orderings: [{ title: 'Par date', name: 'debut', by: [{ field: 'debut', direction: 'asc' }] }],
  preview: {
    select: { title: 'titre', debut: 'debut', lieu: 'lieu' },
    prepare({ title, debut, lieu }) {
      const d = debut ? new Date(debut).toLocaleDateString('fr-FR', { dateStyle: 'medium' }) : '';
      return { title, subtitle: [d, lieu].filter(Boolean).join(' – ') };
    },
  },
});
