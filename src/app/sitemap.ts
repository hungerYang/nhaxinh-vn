import { MetadataRoute } from 'next';
import articles from '@/data/articles.json';
import submissions from '@/data/submissions.json';

const SITE_URL = 'https://hungeryang.github.io/nhaxinh-vn';
const locales = ['vi', 'zh', 'en'];

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of locales) {
    // Home
    routes.push({
      url: `${SITE_URL}/${locale}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/`])
        ),
      },
    });

    // Favorites
    routes.push({
      url: `${SITE_URL}/${locale}/favorites/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/favorites/`])
        ),
      },
    });

    // Submit
    routes.push({
      url: `${SITE_URL}/${locale}/submit/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${SITE_URL}/${l}/submit/`])
        ),
      },
    });

    // Articles
    for (const article of articles) {
      routes.push({
        url: `${SITE_URL}/${locale}/article/${article.id}/`,
        lastModified: new Date(article.date),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/article/${article.id}/`])
          ),
        },
      });
    }

    // Submissions
    for (const submission of submissions) {
      routes.push({
        url: `${SITE_URL}/${locale}/submission/${submission.id}/`,
        lastModified: new Date(submission.date),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}/submission/${submission.id}/`])
          ),
        },
      });
    }
  }

  return routes;
}
