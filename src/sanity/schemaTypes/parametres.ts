import { defineField, defineType } from 'sanity';

export const parametres = defineType({
  name: 'parametres',
  title: 'Paramètres du site',
  type: 'document',
  fields: [
    defineField({ name: 'nom', title: 'Nom de l’association', type: 'string', initialValue: 'Le Sou des écoles de Boëge' }),
    defineField({
      name: 'accroche',
      title: 'Phrase d’accueil',
      description: 'Affichée en grand sur le tableau de la page d’accueil quand aucun événement n’est à venir.',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description courte',
      description: 'Une ou deux phrases, affichées sous le tableau et utilisées par les moteurs de recherche.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'rendezVous',
      title: 'Rendez-vous mis en avant sur l’accueil',
      description: 'Par défaut, l’accueil affiche le prochain événement de l’agenda. Choisissez-en un ici pour le mettre en avant à la place (ignoré une fois la date passée).',
      type: 'reference',
      to: [{ type: 'evenement' }],
    }),
    defineField({
      name: 'annonce',
      title: 'Bandeau d’annonce',
      description: 'Un mot affiché en haut de toutes les pages tant que la case « Afficher » est cochée : annulation, report, rappel important.',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'actif', title: 'Afficher le bandeau', type: 'boolean', initialValue: false },
        { name: 'texte', title: 'Texte', type: 'string', description: 'Une phrase, courte.' },
        {
          name: 'ton',
          title: 'Ton',
          type: 'string',
          initialValue: 'info',
          options: {
            list: [
              { title: 'Information', value: 'info' },
              { title: 'Alerte (annulation, report)', value: 'alerte' },
              { title: 'Bonne nouvelle', value: 'bonne' },
            ],
            layout: 'radio',
          },
        },
        { name: 'lien', title: 'Lien (facultatif)', type: 'string', description: 'Adresse complète ou chemin du site, par exemple /agenda.' },
        { name: 'libelleLien', title: 'Texte du lien', type: 'string', placeholder: 'En savoir plus' },
      ],
    }),
    defineField({ name: 'email', title: 'Email de contact', type: 'string' }),
    defineField({ name: 'facebook', title: 'Page Facebook (URL)', type: 'url' }),
    defineField({ name: 'helloasso', title: 'Page HelloAsso (URL)', type: 'url' }),
    defineField({ name: 'adresse', title: 'Adresse postale', type: 'text', rows: 3 }),
    defineField({
      name: 'cotisation',
      title: 'Cotisation',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'montantUnEnfant', title: 'Montant pour un enfant (€)', type: 'number' }),
        defineField({ name: 'montantParEnfantSuivant', title: 'Montant par enfant à partir du deuxième (€)', type: 'number' }),
        defineField({
          name: 'accroche',
          title: 'Phrase d’accroche',
          type: 'string',
          initialValue: 'L’école a besoin du Sou, le Sou a besoin de vous.',
        }),
        defineField({
          name: 'texte',
          title: 'Texte d’explication',
          type: 'text',
          rows: 4,
        }),
        defineField({
          name: 'utilisations',
          title: 'À quoi sert la cotisation',
          description: 'Une ligne par usage : « Les sorties scolaires », « Le spectacle de Noël »…',
          type: 'array',
          of: [{ type: 'string' }],
        }),
        defineField({
          name: 'bulletin',
          title: 'Bulletin papier (PDF)',
          type: 'file',
          options: { accept: 'application/pdf' },
        }),
      ],
    }),
    defineField({
      name: 'anneeScolaire',
      title: 'Année scolaire en cours',
      type: 'string',
      placeholder: '2026-2027',
    }),
  ],
  preview: { prepare: () => ({ title: 'Paramètres du site' }) },
});
