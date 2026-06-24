import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ArticleDetail from '@/components/sections/ArticleDetail';
import articles from '@/data/articles.json';
import { getLocalizedArticle, getContentById, getRelatedContent } from '@/data/allContent';
import { generateSEOMetadata, generateStructuredData } from '@/lib/seo';
import ArticleSchema from '@/components/seo/ArticleSchema';

export function generateStaticParams() {
  const params: { locale: string; id: string }[] = [];
  for (const locale of locales) {
    for (const article of articles) {
      params.push({ locale, id: String(article.id) });
    }
  }
  return params;
}

export const dynamic = 'force-static';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const article = getLocalizedArticle(id, locale);

  if (!article) {
    return generateSEOMetadata({
      locale,
      title: 'Không tìm thấy',
      description: 'Bài viết không tồn tại',
      path: `/article/${id}`,
    });
  }

  return generateSEOMetadata({
    locale,
    title: article.title,
    description: article.description,
    image: article.image,
    type: 'article',
    publishedTime: article.date,
    author: article.author,
    path: `/article/${id}`,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { locale, id } = await params;
  const article = getLocalizedArticle(id, locale);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedContent(id, article.style, 3);
  const structuredData = generateStructuredData({
    locale: await params.then(p => p.locale),
    title: article.title,
    description: article.description,
    image: article.image,
    type: 'article',
    publishedTime: article.date,
    author: article.author,
    path: `/article/${id}`,
  });

  return (
    <>
      <ArticleSchema article={article} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="flex-1">
        <ArticleDetail article={article} relatedArticles={relatedArticles} />
      </main>
      <Footer />
    </>
  );
}
