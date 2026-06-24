import articlesDataVi from './articles.json';
import articlesDataZh from './articles.zh.json';
import articlesDataEn from './articles.en.json';
import submissionsData from './submissions.json';

export interface ArticleItem {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  style: string;
  room: string;
  date: string;
  author: string;
  readTime: number;
}

export interface SubmissionItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  image: string;
  author: string;
  authorAvatar: string;
  likes: number;
  room: string;
  style: string;
  date: string;
}

export interface UnifiedContentItem {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  images?: string[];
  style: string;
  room: string;
  date: string;
  author: string;
  authorAvatar?: string;
  readTime?: number;
  likes?: number;
  type: 'article' | 'submission';
}

const articles: ArticleItem[] = articlesDataVi as ArticleItem[];
const submissions: SubmissionItem[] = submissionsData as SubmissionItem[];

const articlesByLocale: Record<string, ArticleItem[]> = {
  vi: articlesDataVi as ArticleItem[],
  zh: articlesDataZh as ArticleItem[],
  en: articlesDataEn as ArticleItem[],
};

export function getLocalizedArticle(id: string, locale: string): UnifiedContentItem | undefined {
  const data = articlesByLocale[locale] || articlesByLocale['vi'];
  const article = data.find((a) => String(a.id) === String(id));
  if (!article) return undefined;
  return { ...article, type: 'article' as const };
}

export function getAllContent(): UnifiedContentItem[] {
  const articleItems: UnifiedContentItem[] = articles.map((a) => ({
    ...a,
    type: 'article' as const,
  }));

  const submissionItems: UnifiedContentItem[] = submissions.map((s) => ({
    ...s,
    content: s.content || s.description + '\n\n(Câu chuyện chi tiết sẽ được cập nhật sau khi ngườii dùng gửi thêm thông tin.)',
    authorAvatar: s.authorAvatar || '',
    readTime: 3,
    type: 'submission' as const,
  }));

  return [...articleItems, ...submissionItems];
}

export function getContentById(id: string): UnifiedContentItem | undefined {
  return getAllContent().find((item) => item.id === id);
}

export function getRelatedContent(currentId: string, style: string, limit: number = 3): UnifiedContentItem[] {
  return getAllContent()
    .filter((item) => item.id !== currentId && item.style === style)
    .slice(0, limit);
}

export function getAllContentIds(): string[] {
  return getAllContent().map((item) => item.id);
}
