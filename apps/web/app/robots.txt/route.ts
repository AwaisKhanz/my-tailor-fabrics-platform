import { hasSplitHostnameConfig, isPortalHost, normalizeRequestHost } from '@/lib/host-routing';
import { buildMarketingUrl } from '@/lib/host-routing';

export function GET(request: Request) {
  const host = normalizeRequestHost(new URL(request.url).host);
  const portalRequest = hasSplitHostnameConfig() && isPortalHost(host);

  const body = portalRequest
    ? ['User-agent: *', 'Disallow: /'].join('\n')
    : ['User-agent: *', 'Allow: /', `Sitemap: ${buildMarketingUrl('/sitemap.xml')}`].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
