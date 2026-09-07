import React from 'react';
import { Helmet } from 'react-helmet-async';

const siteUrl = 'https://gulabenterprises.com';
const defaultDescription = 'Gulab Enterprises provides trusted RO repair, AC service, washing machine, refrigerator, and geyser repair in Mirgunj, Gopalganj, Bihar.';
const keywords = 'RO repair Mirgunj, RO service, AC service Mirgunj, appliance repair Gopalganj, washing machine repair, refrigerator repair, geyser repair, Gulab Enterprises';

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteUrl}/#business`,
  name: 'Gulab Enterprises',
  description: defaultDescription,
  url: siteUrl,
  telephone: '+91-6299063855',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Infront of Hiralal Cycle',
    addressLocality: 'Mirgunj',
    addressRegion: 'Bihar',
    postalCode: '841438',
    addressCountry: 'IN',
  },
  areaServed: ['Mirgunj', 'Gopalganj', 'Bihar'],
  serviceType: ['RO repair', 'AC service', 'Washing machine repair', 'Refrigerator repair', 'Geyser repair'],
};

const SEO = ({ title, description = defaultDescription, path = '/', image }) => {
  const canonicalUrl = `${siteUrl}${path}`;

  return (
    <Helmet>
      <html lang="en" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Gulab Enterprises" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {image && <meta property="og:image" content={`${siteUrl}${image}`} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json">{JSON.stringify({ ...localBusinessSchema, url: canonicalUrl })}</script>
    </Helmet>
  );
};

export { siteUrl };
export default SEO;
