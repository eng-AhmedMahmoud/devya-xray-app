import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Exclude the extensionless metadata image routes (opengraph-image, apple-icon,
  // icon) too — otherwise next-intl 307-redirects them to /en/... and they 404.
  matcher: ['/((?!api|_next|_vercel|opengraph-image|apple-icon|icon|manifest|sitemap|robots|.*\\..*).*)'],
};
