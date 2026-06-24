import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import submissionsData from '@/data/submissions.json';
import articlesData from '@/data/articles.json';
import ArticleDetail from '@/components/sections/ArticleDetail';
import type { UnifiedContentItem } from '@/data/allContent';

export const dynamic = 'force-static';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  const paths: { locale: string; id: string }[] = [];
  for (const locale of locales) {
    for (const sub of submissionsData) {
      paths.push({ locale, id: sub.id });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const submission = submissionsData.find(s => s.id === id);
  if (!submission) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nhaxinh.vn';
  const t = {
    vi: 'Bài đăng của người dùng',
    zh: '用户投稿',
    en: 'User Submission',
  }[locale] || 'User Submission';

  return {
    title: `${submission.title} | NhàXinh.vn`,
    description: submission.description,
    alternates: {
      canonical: `${siteUrl}/${locale}/submission/${id}/`,
      languages: {
        vi: `${siteUrl}/vi/submission/${id}/`,
        zh: `${siteUrl}/zh/submission/${id}/`,
        en: `${siteUrl}/en/submission/${id}/`,
      },
    },
    openGraph: {
      title: submission.title,
      description: submission.description,
      type: 'article',
      publishedTime: submission.date,
      images: [{ url: submission.image }],
    },
  };
}

export default async function SubmissionPage({ params }: Props) {
  const { locale, id } = await params;
  const submission = submissionsData.find(s => s.id === id);
  if (!submission) notFound();

  const item: UnifiedContentItem = {
    ...submission,
    content: submission.description || '',
    type: 'submission',
  };

  // Find related articles with same style
  const relatedArticles: UnifiedContentItem[] = articlesData
    .filter(a => a.style === submission.style && a.id !== id)
    .slice(0, 3)
    .map(a => ({ ...a, type: 'article' as const }));

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <ArticleDetail article={item} relatedArticles={relatedArticles} />
    </div>
  );
}