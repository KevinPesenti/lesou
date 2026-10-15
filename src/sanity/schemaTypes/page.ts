import { defineField, defineType } from 'sanity';

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'titre', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Adresse de la page',
      type: 'slug',
      options: { source: 'titre', maxLength: 60 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'dansMenu',
      title: 'Afficher dans le menu',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'ordre',
      title: 'Position dans le menu',
      description: 'Les pages sont triées par ordre croissant.',
      type: 'number',
      initialValue: 10,
    }),
    defineField({ name: 'intro', title: 'Chapeau', type: 'text', rows: 2 }),
    defineField({ name: 'corps', title: 'Contenu', type: 'blockContent' }),
  ],
  orderings: [{ title: 'Ordre du menu', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: {
    select: { title: 'titre', dansMenu: 'dansMenu' },
    prepare({ title, dansMenu }) {
      return { title, subtitle: dansMenu ? 'Dans le menu' : 'Hors menu' };
    },
  },
});
