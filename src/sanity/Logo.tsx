import { createElement } from 'react';
/** Logo affiché dans le Studio (écran de connexion, barre de navigation). */
export const Logo = () =>
  createElement('img', { src: '/logo.png', alt: '', style: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' } });
