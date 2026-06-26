import JsonLd from './JsonLd';

interface ArticleSchemaProps {
  article: {
    id: string;
    title: string;
    description: string;
    image: string;
    date: string;
    author: string;
  };
  locale: string;
}

const SITE_URL = 'https://hungeryang.github.io/nhaxinh-vn';
const SITE_NAME = 'NhàXinh.vn';

export default function ArticleSchema({ article, locale }: ArticleSchemaProps) {
  const url = `${SITE_URL}/${locale}/article/${article.id}/`;
  const ogImage = article.image.startsWith('http')
    ? article.image
    : `${SITE_URL}${article.image}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: ogImage,
    url,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return <JsonLd data={schema} />;
}
