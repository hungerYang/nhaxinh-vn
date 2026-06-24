import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import articles from '@/data/articles.json';
import { locales } from '@/i18n/config';

export const dynamic = 'force-static';

const ALL_ROOMS = [
  'living',
  'bedroom',
  'kitchen',
  'dining',
  'balcony',
  'study',
  'bathroom',
  'entryway',
] as const;

const roomKeyMap: Record<string, string> = {
  living: 'livingRoom',
  bedroom: 'bedroom',
  kitchen: 'kitchen',
  dining: 'diningRoom',
  balcony: 'balcony',
  study: 'study',
  bathroom: 'bathroom',
  entryway: 'entryway',
};

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  images: string[];
  style: string;
  room: string;
  date: string;
  author: string;
  readTime: number;
}

export function generateStaticParams() {
  const params: { locale: string; id: string }[] = [];
  for (const locale of locales) {
    for (const room of ALL_ROOMS) {
      params.push({ locale, id: room });
    }
  }
  return params;
}

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const roomKey = roomKeyMap[id];
  if (!roomKey) {
    return { title: 'Not Found' };
  }
  const t = await getTranslations({ locale, namespace: 'rooms' });
  const roomName = t(roomKey);
  return {
    title: `${roomName} | NhàXinh.vn`,
    description: t('metaDescription', { room: roomName }),
  };
}

export default async function RoomPage({ params }: Props) {
  const { locale, id } = await params;

  const roomKey = roomKeyMap[id];
  if (!roomKey) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'rooms' });
  const roomName = t(roomKey);

  const filteredArticles = (articles as Article[]).filter(
    (article) => article.room === id || article.room === 'all'
  );

  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen bg-[#F5F0E8]">
        {/* Page Header */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-[#2D5A3D] mb-4">
              {roomName}
            </h1>
            <p className="text-center text-gray-600 text-base sm:text-lg">
              {t('posts')} ({filteredArticles.length})
            </p>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="pb-16 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/${locale}/article/${article.id}/`}
                    className="group block bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-gray-300"
                  >
                    {/* Article Image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Article Info */}
                    <div className="p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#2D5A3D] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mb-3">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{article.date}</span>
                        <span>{article.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <div className="text-6xl mb-6">🏠</div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                  {t('noArticles')}
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  {t('noArticlesDesc')}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}