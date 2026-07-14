import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Devya X-Ray',
    short_name: 'X-Ray',
    description:
      'Devya X-Ray — engineering-review consultancy. A code-verified maturity assessment across 7 pillars, delivered in 2 weeks. Free self-serve snapshot.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180' },
    ],
  };
}
