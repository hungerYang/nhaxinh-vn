import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FavoritesPage from '@/components/sections/FavoritesPage';
import { locales } from '@/i18n/config';
import { generateSEOMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi';
  return generateSEOMetadata({
    locale,
    title: isVi ? 'Bài viết đã lưu' : '已收藏文章',
    description: isVi
      ? 'Xem lại những bài viết nội thất bạn đã lưu trên NhàXinh.vn'
      : '查看你在 NhàXinh.vn 收藏的家装文章',
    path: '/favorites',
  });
}

export default async function FavoritesRoute({ params }: Props) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <FavoritesPage />
      </main>
      <Footer />
    </>
  );
}
