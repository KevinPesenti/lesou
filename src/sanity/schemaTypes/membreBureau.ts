import { defineField, defineType } from 'sanity';

export const membreBureau = defineType({
  name: 'membreBureau',
  title: 'Membre du bureau',
  type: 'document',
  fields: [
    defineField({ name: 'nom', title: 'Prénom et nom', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'role',
      title: 'Rôle',
      type: 'string',
      options: {
        list: [
          'Président', 'Présidente', 'Vice-président', 'Vice-présidente',
          'Trésorier', 'Trésorière', 'Trésorier adjoint', 'Trésorière adjointe',
          'Secrétaire', 'Secrétaire adjoint', 'Secrétaire adjointe', 'Membre actif', 'Membre active', 'Membre d’honneur',
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', initialValue: 10 }),
  ],
  orderings: [{ title: 'Ordre d’affichage', name: 'ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'role', media: 'photo' } },
});
