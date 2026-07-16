import type { Metadata } from 'next';

const SITE_URL = 'https://hungeryang.github.io/nhaxinh-vn';
const SITE_NAME = 'NhàXinh.vn';

interface SEOPageConfig {
  title: string;
  description: string;
  locale: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
  path?: string;
}

export function generateSEOMetadata(config: SEOPageConfig): Metadata {
  const { title, description, locale, image, type = 'website', publishedTime, author, path = '' } = config;
  const url = `${SITE_URL}/${locale}${path}`;
  const ogImage = image || `${SITE_URL}/images/hero/hero-1.webp`;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords: [
      'nội thất',
      'thiết kế nội thất',
      'trang trí nhà',
      'phong cách Đông Nam Á',
      'phong cách Pháp thuộc địa',
      'indochine',
      'nhà đẹp Việt Nam',
      'ý tưởng nội thất',
      'home decor',
      'Vietnam interior',
    ],
    authors: author ? [{ name: author }] : [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
      languages: {
        vi: `${SITE_URL}/vi${path}`,
        zh: `${SITE_URL}/zh${path}`,
        en: `${SITE_URL}/en${path}`,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : 'en_US',
      type,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
      creator: '@nhaxinh_vn',
    },
    other: {
      'application-name': SITE_NAME,
      'msapplication-TileColor': '#2D5A3D',
      'theme-color': '#2D5A3D',
    },
  };
}

export function generateStructuredData(config: SEOPageConfig) {
  const { title, description, locale, image, type = 'website', publishedTime, author, path = '' } = config;
  const url = `${SITE_URL}/${locale}${path}`;
  const ogImage = image || `${SITE_URL}/images/hero/hero-1.webp`;

  if (type === 'article') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: ogImage,
      url,
      datePublished: publishedTime || new Date().toISOString(),
      dateModified: publishedTime || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: author || SITE_NAME,
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
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${SITE_URL}/${locale}`,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
