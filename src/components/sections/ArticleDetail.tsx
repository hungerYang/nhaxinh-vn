'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Heart, Clock, User, BookOpen, ChevronUp, Bookmark, ChevronLeft, ChevronRight } from 'lucide-react';
import type { UnifiedContentItem } from '@/data/allContent';
import { useFavorites } from '@/hooks/useFavorites';
import { useLikes } from '@/hooks/useLikes';
import { trackLike, trackFavorite } from '@/lib/analytics';
import ShareButtons from '@/components/shared/ShareButtons';
import CommentSection from '@/components/shared/CommentSection';

interface ArticleDetailProps {
  article: UnifiedContentItem;
  relatedArticles?: UnifiedContentItem[];
}

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

function parseContent(content: string) {
  const blocks: { type: string; content: string; items?: string[] }[] = [];
  const paragraphs = content.split('\n\n');

  paragraphs.forEach((paragraph) => {
    const trimmed = paragraph.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes('\n')) {
      blocks.push({ type: 'heading', content: trimmed.replace(/\*\*/g, '') });
    } else if (trimmed.startsWith('- **') || trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter((item) => item.trim().startsWith('-'));
      blocks.push({ type: 'list', content: '', items });
    } else if (/^\d+\.\s\*\*/.test(trimmed)) {
      const items = trimmed.split('\n').filter((item) => /^\d+\./.test(item.trim()));
      blocks.push({ type: 'numbered-list', content: '', items });
    } else {
      blocks.push({ type: 'paragraph', content: trimmed });
    }
  });

  return blocks;
}

function generateTOC(blocks: { type: string; content: string }[]): TOCItem[] {
  const toc: TOCItem[] = [];
  let headingIndex = 0;
  for (const block of blocks) {
    if (block.type === 'heading') {
      toc.push({
        id: `section-${headingIndex}`,
        title: block.content,
        level: 2,
      });
    }
    headingIndex++;
  }
  return toc;
}

function ContentBlock({
  block,
  index,
}: {
  block: { type: string; content: string; items?: string[] };
  index: number;
}) {
  if (block.type === 'heading') {
    return (
      <h2
        id={`section-${index}`}
        className="text-xl sm:text-2xl font-bold text-[#2D5A3D] mt-10 mb-4 scroll-mt-20"
      >
        {block.content}
      </h2>
    );
  }

  if (block.type === 'list' && block.items) {
    return (
      <ul className="space-y-3 ml-2 sm:ml-4 my-4">
        {block.items.map((item, i) => {
          const boldMatch = item.match(/\*\*(.*?)\*\*/);
          const text = item.replace(/^- /, '').replace(/\*\*/g, '');
          return (
            <li key={i} className="flex items-start gap-3 text-[#444] leading-relaxed">
              <span className="w-2 h-2 rounded-full bg-[#C4A35A] mt-2 flex-shrink-0" />
              <span>
                {boldMatch ? (
                  <>
                    <strong className="text-[#2D2D2D]">{boldMatch[1]}</strong>
                    {text.replace(`**${boldMatch[1]}**`, '')}
                  </>
                ) : (
                  text
                )}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  if (block.type === 'numbered-list' && block.items) {
    return (
      <ol className="space-y-3 ml-2 sm:ml-4 my-4 list-decimal list-inside">
        {block.items.map((item, i) => {
          const boldMatch = item.match(/\*\*(.*?)\*\*/);
          const text = item.replace(/^\d+\.\s/, '').replace(/\*\*/g, '');
          return (
            <li key={i} className="text-[#444] leading-relaxed">
              {boldMatch ? (
                <>
                  <strong className="text-[#2D2D2D]">{boldMatch[1]}</strong>
                  {text.replace(`**${boldMatch[1]}**`, '')}
                </>
              ) : (
                text
              )}
            </li>
          );
        })}
      </ol>
    );
  }

  // Paragraph
  const text = block.content.replace(/\*\*/g, '');
  return (
    <p className="text-[#444] leading-relaxed text-base sm:text-lg my-4">
      {text}
    </p>
  );
}

export default function ArticleDetail({ article, relatedArticles = [] }: ArticleDetailProps) {
  const t = useTranslations('article');
  const locale = useLocale();
  const { isLiked, toggleLike } = useLikes();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showBackTop, setShowBackTop] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const liked = isLiked(article.id);
  const bookmarked = isFavorite(article.id);

  const styleLabel = article.style === 'se-asia' ? t('styleSeAsia') : t('styleFrench');
  const styleColor = article.style === 'se-asia' ? 'bg-[#2D5A3D]' : 'bg-[#C4A35A]';
  const isSubmission = article.type === 'submission';

  const blocks = useMemo(() => parseContent(article.content), [article.content]);
  const toc = useMemo(() => generateTOC(blocks), [blocks]);

  // Scroll spy for TOC
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 600);

      const sections = toc.map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return { id: item.id, top: 0 };
        return { id: item.id, top: el.getBoundingClientRect().top };
      });

      const current = sections.find((s) => s.top > -100 && s.top < 200);
      if (current) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  return (
    <article className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${article.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 flex items-center gap-2">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-[#2D2D2D] hover:bg-white transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('backHome')}</span>
          </Link>
        </div>

        {/* Bookmark Button */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <button
          onClick={() => {
            toggleFavorite(article.id);
            trackFavorite(article.id);
          }}
          className={`p-2.5 rounded-full backdrop-blur-sm transition-colors shadow-sm ${
            bookmarked ? 'bg-[#C4A35A] text-white' : 'bg-white/90 text-[#2D2D2D] hover:bg-white'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
        </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <span className={`inline-block px-3 py-1 ${styleColor} text-white text-xs font-medium rounded-full mb-3`}>
              {styleLabel}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime || 3} {t('readTime')}
              </span>
              <span className="text-white/40">|</span>
              <span>{article.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar TOC - Desktop only */}
          {toc.length > 0 && (
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-24">
                <h4 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3">
                  {t('tableOfContents')}
                </h4>
                <nav className="space-y-1.5">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm transition-colors py-1 ${
                        activeSection === item.id
                          ? 'text-[#2D5A3D] font-medium border-l-2 border-[#2D5A3D] pl-3'
                          : 'text-[#888] hover:text-[#2D5A3D] pl-3 border-l-2 border-transparent'
                      }`}
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Article Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Author Info */}
            <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#EBE5D9]">
              {isSubmission && article.authorAvatar ? (
                <img
                  src={article.authorAvatar}
                  alt={article.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#2D5A3D] flex items-center justify-center">
                  {isSubmission ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-white" />
                  )}
                </div>
              )}
              <div>
                <p className="font-semibold text-[#2D2D2D]">{article.author}</p>
                <p className="text-sm text-[#888]">
                  {isSubmission ? t('userSubmitted') : t('editorialTeam')}
                </p>
              </div>
              {isSubmission && article.likes !== undefined && (
                <div className="ml-auto flex items-center gap-1 text-[#C45C3E]">
                  <Heart className="w-5 h-5" fill="currentColor" />
                  <span className="font-medium">{article.likes}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-lg sm:text-xl text-[#555] italic mb-8 leading-relaxed border-l-4 border-[#C4A35A] pl-4">
              {article.description}
            </p>

            {/* Image Carousel */}
            {article.images && article.images.length > 0 && (
              <div className="mb-10">
                <div className="relative overflow-hidden rounded-xl bg-[#F5F0E8]">
                  {/* Main Image */}
                  <div className="aspect-[16/9] relative">
                    <img
                      src={article.images[currentImageIndex]}
                      alt={`${article.title} - ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    {/* Navigation Arrows */}
                    {article.images && article.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? (article.images?.length || 1) - 1 : prev - 1))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#2D2D2D] hover:bg-white transition-colors shadow-sm"
                          aria-label={t('prevImage')}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === (article.images?.length || 1) - 1 ? 0 : prev + 1))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#2D2D2D] hover:bg-white transition-colors shadow-sm"
                          aria-label={t('nextImage')}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        {/* Image Counter */}
                        <div className="absolute top-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                          {currentImageIndex + 1} / {article.images?.length || 1}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {/* Thumbnail Strip */}
                {article.images && article.images.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {article.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${
                          idx === currentImageIndex
                            ? 'ring-2 ring-[#2D5A3D] ring-offset-2'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${article.title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content Body */}
            <div className="mb-10">
              {blocks.map((block, index) => (
                <ContentBlock key={index} block={block} index={index} />
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1 bg-[#F5F0E8] text-[#666] text-xs rounded-full">
                #{article.style || 'noi-that'}
              </span>
              <span className="px-3 py-1 bg-[#F5F0E8] text-[#666] text-xs rounded-full">
                #{article.room !== 'all' ? article.room : 'noi-that'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 py-6 border-t border-b border-[#EBE5D9] mb-10">
              <button
                onClick={() => {
                  toggleLike(article.id);
                  trackLike(article.id, article.title);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${
                  liked
                    ? 'bg-[#C45C3E] text-white'
                    : 'bg-[#F5F0E8] text-[#2D5A3D] hover:bg-[#EBE5D9]'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                {liked ? t('liked') : t('like')}
              </button>
              <ShareButtons title={article.title} description={article.description} articleId={article.id} />
            </div>

            {/* Comments Section */}
            <CommentSection articleId={article.id} />
          </div>
        </div>
      </div>

      {/* Related Content */}
      {relatedArticles.length > 0 && (
        <section className="bg-[#F9F7F2] py-10 sm:py-14">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D2D2D] mb-6">
              {t('relatedArticles')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedArticles.map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}${item.type === 'submission' ? `/submission/${item.id}` : `/article/${item.id}`}`}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-[#2D2D2D] line-clamp-2 group-hover:text-[#2D5A3D] transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Top - Mobile */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-[#2D5A3D] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#1E4530] transition-colors"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </article>
  );
}
