import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CVin.Bio',
    short_name: 'CVin.Bio',
    description: 'Convert your CV into a shareable website.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#09090b',
    icons: [
      {
        src: '/favicon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
      }
    ],
  };
}
