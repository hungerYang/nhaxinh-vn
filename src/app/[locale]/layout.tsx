import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import WebSiteSchema from '@/components/seo/WebSiteSchema';
import { AuthProvider } from '@/components/auth/AuthProvider';
import ChatWidget from '@/components/shared/ChatWidget';

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
  // Explicitly load messages for the current locale
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  const affiliateDisclosure: Record<string, string> = {
    vi: 'Một số liên kết trên trang này là liên kết tiếp thị. Chúng tôi có thể nhận hoa hồng khi bạn mua qua các liên kết này.',
    zh: '本页面部分链接为联盟营销链接。通过这些链接购买商品，我们可能会获得佣金。',
    en: 'Some links on this page are affiliate links. We may earn a commission when you purchase through these links.',
  };

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <WebSiteSchema />
        {children}
        <ChatWidget />
        <footer className="w-full py-4 text-center">
          <p className="text-xs text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed">
            {affiliateDisclosure[locale] || affiliateDisclosure.vi}
          </p>
        </footer>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
