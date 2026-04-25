import { MarketingHomePage } from '@/components/marketing/marketing-home-page';
import { buildMarketingMetadata } from '@/lib/marketing-metadata';

export const metadata = buildMarketingMetadata({
  title: 'Premium tailoring and fabrics in Lahore | My Tailor & Fabrics',
  description:
    'Premium tailoring, custom stitching, fabric guidance, and refined finishing for Shalwar Kameez, coats, waistcoats, sherwani, and formal menswear.',
  pathname: '/',
});

export default function MarketingHomeRoute() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'My Tailor & Fabrics',
    description:
      'Premium tailoring, custom stitching, and fabric guidance for modern South Asian menswear.',
    url: 'https://mytailorandfabrics.com',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MarketingHomePage />
    </>
  );
}
