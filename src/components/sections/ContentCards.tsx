'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, Bookmark, Loader2, Images } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import articlesData from '@/data/articles.json';
import submissionsData from '@/data/submissions.json';

const ITEMS_PER_PAGE = 12;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface StyleItem {
  id: string;
  name: string;
  nameEn: string;
  nameZh: string;
  color: string;
  icon: string;
  type: string;
}

type FilterType = 'all' | string;

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  image: string;
  images?: string[];
  style?: string;
  room?: string;
  date: string;
  author: string;
  authorAvatar?: string;
  likes?: number;
  type: 'article' | 'submission';
}

function getStyleTag(style?: string, styles?: StyleItem[]) {
  if (!style || !styles) return null;
  const found = styles.find(s => s.id === style);
  if (!found) return null;
  return { label: found.name, color: found.color, icon: found.icon };
}

function MasonryCard({ item, t, styles }: { item: ContentItem; t: ReturnType<typeof useTranslations>; styles?: StyleItem[] }) {
  const locale = useLocale();
  const styleTag = getStyleTag(item.style, styles);
  const hasMultipleImages = item.images && item.images.length > 1;
  const authorInitial = item.author.charAt(0).toUpperCase();
  const likeCount = useMemo(() => item.likes ?? Math.floor(Math.random() * 50) + 1, [item.id, item.likes]);

  return (
    <Link
      href={`/${locale}${item.type === 'submission' ? `/submission/${item.id}` : `/article/${item.id}`}`}
      className="group block break-inside-avoid mb-4"
    >
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        {/* Image Area */}
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={item.image}
            alt={item.title}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            style={{ aspectRatio: '3/4' }}
          />

          {/* Style Tag - overlaid on image */}
          {styleTag && (
            <div className="absolute top-2.5 left-2.5">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: styleTag.color }}
              >
                {styleTag.icon} {styleTag.label}
              </span>
            </div>
          )}

          {/* Multi-image indicator */}
          {hasMultipleImages && (
            <div className="absolute top-2.5 right-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-[10px] text-white font-medium">
                <Images className="w-3 h-3" />
                1/{item.images!.length}
              </span>
            </div>
          )}

          {/* User submission badge */}
          {item.type === 'submission' && !styleTag && (
            <div className="absolute top-2.5 right-2.5">
              <span className="px-2 py-0.5 bg-orange-500 rounded-full text-[10px] text-white font-medium">
                {t('userSubmission')}
              </span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-[#2D5A3D] transition-colors">
            {item.title}
          </h3>

          {/* Author Row */}
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#2D5A3D] to-[#4a8c5e] flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-white">{authorInitial}</span>
            </div>
            <span className="text-xs text-gray-500 truncate">{item.author}</span>
            <span className="text-xs text-gray-300 flex-shrink-0">{item.date}</span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span className="text-xs">{likeCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-gray-400 hover:text-[#2D5A3D] transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ContentCards() {
  const t = useTranslations('content');
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [styles, setStyles] = useState<StyleItem[]>([]);

  // Load styles from API on mount
  useEffect(() => {
    async function loadStyles() {
      try {
        const res = await fetch(`${API_BASE}/api/styles`);
        if (res.ok) {
          const data = await res.json();
          setStyles(data.styles || []);
        }
      } catch {
        // Fallback to empty styles, filters will just show "All"
      }
    }
    loadStyles();
  }, []);

  const allItems = useMemo(() => {
    const articles = articlesData.map((a) => ({
      ...a,
      type: 'article' as const,
    }));
    const submissions = submissionsData.map((s) => ({
      ...s,
      type: 'submission' as const,
    }));
    return [...articles, ...submissions];
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return allItems;
    if (activeFilter === 'user-submitted') return allItems.filter((item) => item.type === 'submission');
    return allItems.filter((item) => item.style === activeFilter);
  }, [activeFilter, allItems]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount);
  }, [filteredItems, visibleCount]);

  const hasMore = visibleCount < filteredItems.length;

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Build filter buttons: "All" + styles grouped by type
  const filters = useMemo(() => {
    const result: { key: FilterType; label: string; icon?: string; color?: string }[] = [
      { key: 'all', label: t('filters.all') },
      { key: 'user-submitted', label: t('filters.user') },
    ];

    // Group styles by type: style first, then content, then source
    const typeOrder = ['style', 'content', 'source'];
    const sorted = [...styles].sort((a, b) => {
      const aIdx = typeOrder.indexOf(a.type);
      const bIdx = typeOrder.indexOf(b.type);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });

    for (const s of sorted) {
      // Get localized name based on locale
      let name = s.name;
      if (locale === 'en') name = s.nameEn;
      else if (locale === 'zh') name = s.nameZh;
      result.push({
        key: s.id,
        label: name,
        icon: s.icon,
        color: s.color,
      });
    }

    return result;
  }, [styles, locale, t]);

  return (
    <section id="content-cards" className="py-12 sm:py-16 lg:py-20 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D5A3D]">
            {t('title')}
          </h2>
          <Link
            href={`/${locale}/submit`}
            className="self-start sm:self-auto px-4 py-2 bg-[#2D5A3D] text-white rounded-full text-sm font-medium hover:bg-[#1a3d2a] transition-colors"
          >
            {t('shareYourHome')}
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                activeFilter === filter.key
                  ? 'text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'
              }`}
              style={activeFilter === filter.key
                ? { backgroundColor: filter.color || '#2D5A3D' }
                : undefined
              }
            >
              {filter.icon && <span>{filter.icon}</span>}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Result Count */}
        <div className="mb-4 text-sm text-gray-400">
          {t('showing')} {displayedItems.length} / {filteredItems.length} {t('items')}
        </div>

        {/* Masonry Layout - CSS columns based */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('noResults')}</h3>
            <p className="text-sm text-gray-400">{t('tryDifferentFilter')}</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {displayedItems.map((item) => (
              <MasonryCard key={`${item.type}-${item.id}`} item={item as ContentItem} t={t} styles={styles} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#2D5A3D] rounded-full font-medium border border-gray-200 hover:bg-[#2D5A3D] hover:text-white hover:border-[#2D5A3D] transition-all"
            >
              <Loader2 className="w-4 h-4" />
              {t('loadMore')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
