import type { MetadataRoute } from 'next';

/** PWA: installierbar auf Android und iPhone (Startbildschirm), Farben wie legacy/index.html. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Smart Deutsch Akademie',
    short_name: 'Smart Deutsch',
    description: 'Academy System der Smart Deutsch Akademie',
    lang: 'de',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#1b1d21',
    theme_color: '#1b1d21',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
