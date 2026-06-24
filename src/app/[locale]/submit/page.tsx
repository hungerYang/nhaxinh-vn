import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SubmitForm from '@/components/sections/SubmitForm';
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
    title: isVi ? 'Chia sẻ không gian sống' : '分享你的家居空间',
    description: isVi
      ? 'Đăng bài chia sẻ góc nhà đẹp của bạn với cộng đồng NhàXinh.vn'
      : '向 NhàXinh.vn 社区投稿分享你的美丽家居',
    path: '/submit',
  });
}

export default async function SubmitRoute({ params }: Props) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <SubmitForm />
      </main>
      <Footer />
    </>
  );
}
