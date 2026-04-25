import type { Metadata } from 'next';
import { getMarketingSiteUrl, getPortalBaseUrl } from '@/lib/env';
import { siteConfig } from '@/lib/config';

function buildUrl(pathname: string) {
  return new URL(pathname, getMarketingSiteUrl());
}

export function buildMarketingMetadata(options: {
  title: string;
  description: string;
  pathname: string;
}): Metadata {
  const canonicalUrl = buildUrl(options.pathname);

  return {
    title: options.title,
    description: options.description,
    metadataBase: new URL(getMarketingSiteUrl()),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      title: options.title,
      description: options.description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: '/logo.png',
          alt: `${siteConfig.name} marketing preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: options.title,
      description: options.description,
      images: ['/logo.png'],
    },
  };
}

export function buildPortalLoginUrl() {
  return `${getPortalBaseUrl()}/login`;
}
