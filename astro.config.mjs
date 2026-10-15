// @ts-check
import { defineConfig } from 'astro/config';
import sanity from '@sanity/astro';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const SITE = process.env.PUBLIC_SITE_URL || 'https://lesoudeboege.fr';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sanity({
      projectId: '4lcj5kde',
      dataset: 'production',
      apiVersion: '2026-10-01',
      useCdn: false,
      // Le back-office est accessible sur /admin
      studioBasePath: '/admin',
    }),
    react(),
    sitemap({ filter: (page) => !page.includes('/admin') }),
  ],
});
