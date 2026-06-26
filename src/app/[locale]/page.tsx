import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import AdSlot from '@/components/shared/AdSlot';
import { locales } from '@/i18n/config';
import { generateSEOMetadata, generateStructuredData } from '@/lib/seo';

const RoomNavigator = nextDynamic(() => import('@/components/sections/RoomNavigator'), {
  loading: () => (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});
const ContentCards = nextDynamic(() => import('@/components/sections/ContentCards'), {
  loading: () => (
    <section className="py-12 sm:py-16 lg:py-20 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-8 animate-pulse" />
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="mb-4 aspect-[3/4] bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});
const Partnerships = nextDynamic(() => import('@/components/sections/Partnerships'), {
  loading: () => (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});
const VideoShowcase = nextDynamic(() => import('@/components/sections/VideoShowcase'), {
  loading: () => (
    <section className="py-12 sm:py-16 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});
const AffiliateProducts = nextDynamic(() => import('@/components/sections/AffiliateProducts'), {
  loading: () => (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  ),
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-static';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    vi: 'Nền Tảng Chia Sẻ Thiết Kế Nội Thất Việt Nam',
    zh: '越南家装设计分享平台',
    en: 'Vietnam Interior Design Sharing Platform',
  };
  const descriptions: Record<string, string> = {
    vi: 'Khám phá ý tưởng thiết kế nội thất đẹp cho ngôi nhà Việt. Phong cách Đông Nam Á hiện đại và Pháp thuộc địa.',
    zh: '发现越南家居设计灵感。现代东南亚风格与法式殖民风格。',
    en: 'Discover beautiful interior design ideas for Vietnamese homes. Modern Southeast Asian and French Colonial styles.',
  };
  return generateSEOMetadata({
    locale,
    title: titles[locale] || titles.vi,
    description: descriptions[locale] || descriptions.vi,
    path: '/',
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const structuredData = generateStructuredData({
    locale,
    title: 'NhàXinh.vn',
    description: 'Nền tảng chia sẻ thiết kế nội thất Việt Nam',
    path: '/',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <RoomNavigator />
        <ContentCards />
        <VideoShowcase />
        <AffiliateProducts />
        
        {/* Ad Placeholders - hidden by default */}
        <AdSlot slotId="banner-1" format="banner" minHeight={90} />
        <AdSlot slotId="sidebar-1" format="sidebar" minHeight={250} />
        
        <Partnerships />
      </main>
      <Footer />
    </>
  );
}
