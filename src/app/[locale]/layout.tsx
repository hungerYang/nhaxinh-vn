import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { NextIntlClientProvider } from 'next-intl';
import { Noto_Sans } from 'next/font/google';
import WebSiteSchema from '@/components/seo/WebSiteSchema';
import { AuthProvider } from '@/components/auth/AuthProvider';
import WebVitalsMonitor from '@/components/analytics/WebVitalsMonitor';

const notoSans = Noto_Sans({
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  variable: '--font-noto-sans',
});

const ChatWidget = dynamic(() => import('@/components/shared/ChatWidget'));

const localeTitles: Record<string, string> = {
  vi: 'Nền Tảng Chia Sẻ Thiết Kế Nội Thất Việt Nam',
  zh: '越南家装设计分享平台',
  en: 'Vietnam Interior Design Sharing Platform',
};

const localeDescriptions: Record<string, string> = {
  vi: 'Khám phá ý tưởng thiết kế nội thất đẹp cho ngôi nhà Việt. Phong cách Đông Nam Á hiện đại và Pháp thuộc địa.',
  zh: '发现越南家居设计灵感。现代东南亚风格与法式殖民风格。',
  en: 'Discover beautiful interior design ideas for Vietnamese homes. Modern Southeast Asian and French Colonial styles.',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = localeTitles[locale] || localeTitles.vi;
  const description = localeDescriptions[locale] || localeDescriptions.vi;

  return {
    title: {
      default: `${title} | NhàXinh.vn`,
      template: `%s | NhàXinh.vn`,
    },
    description,
    openGraph: {
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} className={`h-full antialiased ${notoSans.variable}`}>
      <head>
        <link
          rel="preload"
          as="image"
          href="/nhaxinh-vn/images/hero/hero-1.jpg"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" style={{ fontFamily: 'var(--font-noto-sans), system-ui, sans-serif' }}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <WebVitalsMonitor />
            <WebSiteSchema />
            {children}
            <ChatWidget />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
