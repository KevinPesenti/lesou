import { defineField, defineType } from 'sanity';

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({ name: 'titre', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      description: 'Générée automatiquement depuis le titre. Cliquez sur « Générer ».',
      type: 'slug',
      options: { source: 'titre', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date de publication',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image principale (affiche, photo)',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Description (pour les malvoyants)', type: 'string' }],
    }),
    defineField({
      name: 'resume',
      title: 'Résumé',
      description: 'Deux ou trois phrases affichées sur la page d’accueil et dans la liste des actualités.',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'corps', title: 'Texte de l’article', type: 'blockContent' }),
    defineField({
      name: 'piecesJointes',
      title: 'Documents joints',
      description: 'Bulletins d’inscription, bons de commande, affiches en PDF…',
      type: 'array',
      of: [
        {
          type: 'file',
          fields: [{ name: 'titre', title: 'Titre affiché', type: 'string' }],
        },
      ],
    }),
  ],
  orderings: [{ title: 'Plus récents d’abord', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: {
    select: { title: 'titre', date: 'date', media: 'image' },
    prepare({ title, date, media }) {
      return {
        title,
        subtitle: date ? new Date(date).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'Sans date',
        media,
      };
    },
  },
});
