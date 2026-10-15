import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { frFRLocale } from '@sanity/locale-fr-fr';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';
import { Logo } from './src/sanity/Logo';

const SINGLETONS = new Set(['parametres']);

export default defineConfig({
  name: 'lesou',
  title: 'Le Sou des écoles de Boëge',
  icon: Logo,
  projectId: '4lcj5kde',
  dataset: 'production',
  plugins: [structureTool({ structure, title: 'Contenu' }), frFRLocale()],
  schema: {
    types: schemaTypes,
    // On ne propose pas de créer un second document "Paramètres"
    templates: (templates) => templates.filter((t) => !SINGLETONS.has(t.schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? actions.filter(({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
});
