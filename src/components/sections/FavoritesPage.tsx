'use client';

import { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Bookmark, Trash2 } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import articlesData from '@/data/articles.json';
import submissionsData from '@/data/submissions.json';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  image: string;
  type: 'article' | 'submission';
  style: string;
  room: string;
  author: string;
  date: string;
}

export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const locale = useLocale();
  const { favorites, removeFavorite, isReady } = useFavorites();

  const allItems = useMemo(() => {
    const articles = articlesData.map((a) => ({ ...a, type: 'article' as const }));
    const submissions = submissionsData.map((s) => ({ ...s, type: 'submission' as const }));
    return [...articles, ...submissions] as ContentItem[];
  }, []);

  const favoriteItems = useMemo(() => {
    return allItems.filter((item) => favorites.includes(item.id));
  }, [allItems, favorites]);

  if (!isReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2D5A3D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#F9F7F2] py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-[#888] hover:text-[#2D5A3D] text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backHome')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] flex items-center gap-3">
            <Bookmark className="w-7 h-7 text-[#C4A35A]" />
            {t('title')}
          </h1>
          <p className="text-[#888] mt-2">
            {favoriteItems.length} {t('count')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {favoriteItems.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 text-[#E0D8CC] mx-auto mb-4" />
            <h2 className="text-lg font-medium text-[#2D2D2D] mb-2">{t('emptyTitle')}</h2>
            <p className="text-[#888] text-sm mb-6">{t('emptyDesc')}</p>
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2D5A3D] text-white rounded-full font-medium hover:bg-[#1E4530] transition-colors"
            >
              {t('browseContent')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {favoriteItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <Link href={`/${locale}${item.type === 'submission' ? `/submission/${item.id}` : `/article/${item.id}`}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 text-white text-[10px] font-medium rounded-full ${
                        item.type === 'article' ? 'bg-[#2D5A3D]' : 'bg-[#C4A35A]'
                      }`}
                    >
                      {item.type === 'article' ? t('typeArticle') : t('typeSubmission')}
                    </span>
                  </div>
                  <Link href={`/${locale}${item.type === 'submission' ? `/submission/${item.id}` : `/article/${item.id}`}`}>
                    <h3 className="font-medium text-[#2D2D2D] line-clamp-2 group-hover:text-[#2D5A3D] transition-colors text-sm">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-[#999] mt-1 line-clamp-1">{item.description}</p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                  title={t('remove')}
                >
                  <Trash2 className="w-4 h-4 text-[#C45C3E]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
