'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const rooms = [
  { id: 'living', nameKey: 'livingRoom', count: 9, image: '/images/rooms/living.jpg' },
  { id: 'bedroom', nameKey: 'bedroom', count: 9, image: '/images/rooms/bedroom.jpg' },
  { id: 'kitchen', nameKey: 'kitchen', count: 9, image: '/images/rooms/kitchen.jpg' },
  { id: 'dining', nameKey: 'diningRoom', count: 9, image: '/images/rooms/dining.jpg' },
  { id: 'balcony', nameKey: 'balcony', count: 8, image: '/images/rooms/balcony.jpg' },
  { id: 'study', nameKey: 'study', count: 8, image: '/images/rooms/study.jpg' },
  { id: 'bathroom', nameKey: 'bathroom', count: 9, image: '/images/rooms/bathroom.jpg' },
  { id: 'entryway', nameKey: 'entryway', count: 8, image: '/images/rooms/entryway.jpg' },
];

export default function RoomNavigator() {
  const t = useTranslations('rooms');
  const locale = useLocale();

  return (
    <section id="rooms" className="py-12 sm:py-16 lg:py-20 bg-[#F5F0E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-[#2D5A3D]">
          {t('title')}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={`/${locale}/rooms/${room.id}`}
              className="group block relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Background Image using standard img tag for reliable loading */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={room.image}
                alt={t(room.nameKey)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay - always visible on mobile, hover on desktop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-[#2D5A3D]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Default Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 lg:p-5 group-hover:opacity-0 transition-opacity duration-300">
                <h3 className="text-white text-sm sm:text-base lg:text-lg font-semibold mb-0.5 sm:mb-1">
                  {t(room.nameKey)}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm">
                  {room.count} {t('posts')}
                </p>
              </div>

              {/* Hover Reveal Content - IKEA Style */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-white text-lg sm:text-xl font-bold mb-2 text-center">
                  {t(room.nameKey)}
                </h3>
                <p className="text-white/90 text-sm mb-4">
                  {room.count} {t('posts')}
                </p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#2D5A3D] rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                  {t('explore')}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
