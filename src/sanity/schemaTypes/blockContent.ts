import { defineArrayMember, defineType } from 'sanity';

/** Texte riche utilisé dans les articles et les pages. */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Texte',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraphe', value: 'normal' },
        { title: 'Titre', value: 'h2' },
        { title: 'Sous-titre', value: 'h3' },
        { title: 'Citation', value: 'blockquote' },
      ],
      lists: [
        { title: 'Liste à puces', value: 'bullet' },
        { title: 'Liste numérotée', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' },
          { title: 'Souligné', value: 'underline' },
        ],
        annotations: [
          {
            name: 'link',
            title: 'Lien',
            type: 'object',
            fields: [
              {
                name: 'href',
                title: 'Adresse (URL)',
                type: 'url',
                validation: (rule) => rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: 'image',
      title: 'Image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Description (pour les malvoyants)', type: 'string' },
        { name: 'legende', title: 'Légende', type: 'string' },
      ],
    }),
    defineArrayMember({
      type: 'file',
      name: 'fichier',
      title: 'Document à télécharger',
      fields: [{ name: 'titre', title: 'Titre affiché', type: 'string' }],
    }),
    defineArrayMember({
      type: 'object',
      name: 'galerie',
      title: 'Galerie photos',
      icon: () => '🖼️',
      fields: [
        { name: 'titre', title: 'Titre (facultatif)', type: 'string' },
        {
          name: 'images',
          title: 'Photos',
          description: 'Vous pouvez glisser plusieurs photos d’un coup.',
          type: 'array',
          validation: (rule) => rule.min(1),
          of: [
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                { name: 'alt', title: 'Description (pour les malvoyants)', type: 'string' },
                { name: 'legende', title: 'Légende', type: 'string' },
              ],
            },
          ],
        },
      ],
      preview: {
        select: { titre: 'titre', images: 'images' },
        prepare: ({ titre, images }) => ({ title: titre || 'Galerie photos', subtitle: `${images?.length ?? 0} photo(s)` }),
      },
    }),
    defineArrayMember({
      type: 'object',
      name: 'faq',
      title: 'Questions fréquentes',
      icon: () => '❓',
      fields: [
        { name: 'titre', title: 'Titre', type: 'string', initialValue: 'Questions fréquentes' },
        {
          name: 'questions',
          title: 'Questions',
          type: 'array',
          validation: (rule) => rule.min(1),
          of: [
            {
              type: 'object',
              name: 'qr',
              title: 'Question',
              fields: [
                { name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() },
                { name: 'reponse', title: 'Réponse', type: 'text', rows: 3, validation: (rule) => rule.required() },
              ],
              preview: { select: { title: 'question', subtitle: 'reponse' } },
            },
          ],
        },
      ],
      preview: {
        select: { titre: 'titre', questions: 'questions' },
        prepare: ({ titre, questions }) => ({
          title: titre || 'Questions fréquentes',
          subtitle: `${questions?.length ?? 0} question(s)`,
        }),
      },
    }),
  ],
});
