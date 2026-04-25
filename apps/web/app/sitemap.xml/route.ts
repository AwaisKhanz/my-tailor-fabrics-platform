import { hasSplitHostnameConfig, isPortalHost, normalizeRequestHost } from '@/lib/host-routing';
import { buildMarketingUrl } from '@/lib/host-routing';

const marketingPaths = ['/'] as const;

function toSitemapXml(urls: readonly string[]) {
  const items = urls
    .map(
      (url) => `<url><loc>${url}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
}

export function GET(request: Request) {
  const host = normalizeRequestHost(new URL(request.url).host);
  const portalRequest = hasSplitHostnameConfig() && isPortalHost(host);

  const body = portalRequest
    ? toSitemapXml([])
    : toSitemapXml(marketingPaths.map((pathname) => buildMarketingUrl(pathname)));

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
