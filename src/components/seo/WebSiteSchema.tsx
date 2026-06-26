import JsonLd from './JsonLd';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'NhàXinh.vn',
  url: 'https://hungeryang.github.io/nhaxinh-vn',
  description: "Vietnam's interior design sharing platform",
  inLanguage: ['vi', 'zh', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://hungeryang.github.io/nhaxinh-vn/vi/?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function WebSiteSchema() {
  return <JsonLd data={websiteSchema} />;
}
