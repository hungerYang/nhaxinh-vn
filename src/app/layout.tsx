import type { Metadata } from "next";
import ServiceWorkerRegistration from "@/components/analytics/ServiceWorkerRegistration";
import PreconnectHints from "@/components/performance/PreconnectHints";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hungeryang.github.io/nhaxinh-vn"),
  title: "NhàXinh.vn",
  description: "Khám phá ý tưởng thiết kế nội thất đẹp cho ngôi nhà Việt. Phong cách Đông Nam Á hiện đại và Pháp thuộc địa.",
  keywords: ["nội thất", "thiết kế nội thất", "trang trí nhà", "phong cách Đông Nam Á", "phong cách Pháp thuộc địa", "indochine", "nhà đẹp Việt Nam"],
  authors: [{ name: "NhàXinh.vn" }],
  creator: "NhàXinh.vn",
  publisher: "NhàXinh.vn",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      vi: "/vi/",
      zh: "/zh/",
      en: "/en/",
    },
  },
  openGraph: {
    siteName: "NhàXinh.vn",
    type: "website",
    images: [
      {
        url: "/images/hero/hero-1.webp",
        width: 1200,
        height: 630,
        alt: "NhàXinh.vn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/hero/hero-1.webp"],
  },
  other: {
    "application-name": "NhàXinh.vn",
    "msapplication-TileColor": "#2D5A3D",
    "theme-color": "#2D5A3D",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "NhàXinh",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <PreconnectHints />
      <ServiceWorkerRegistration />
      {children}
    </>
  );
}
