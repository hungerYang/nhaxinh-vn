'use client';

import { useEffect } from 'react';
import { defaultLocale } from '@/i18n/config';

export default function RootPage() {
  useEffect(() => {
    // Redirect to default locale
    const target = `/nhaxinh-vn/${defaultLocale}/`;
    if (window.location.pathname !== target) {
      window.location.href = target;
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A3D] mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
