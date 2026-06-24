import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import RoomNavigator from '@/components/sections/RoomNavigator';
import ContentCards from '@/components/sections/ContentCards';
import VideoShowcase from '@/components/sections/VideoShowcase';
import AffiliateProducts from '@/components/sections/AffiliateProducts';
import Partnerships from '@/components/sections/Partnerships';
import AdSlot from '@/components/shared/AdSlot';
import { locales } from '@/i18n/config';
import { generateSEOMetadata, generateStructuredData } from '@/lib/seo';

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
