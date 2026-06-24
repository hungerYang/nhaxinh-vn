'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight, Building2, Palette, Ruler, Phone, Mail, MapPin } from 'lucide-react';

const partners = [
  {
    name: 'Studio A Design',
    specialty: 'Thiết kế nội thất cao cấp',
    image: './images/rooms/living.jpg',
    icon: Building2,
    location: 'Hà Nội',
    projects: 120,
  },
  {
    name: 'Atelier B',
    specialty: 'Tư vấn phong cách',
    image: './images/rooms/bedroom.jpg',
    icon: Palette,
    location: 'TP. Hồ Chí Minh',
    projects: 85,
  },
  {
    name: 'Design Lab C',
    specialty: 'Thi công trọn gói',
    image: './images/rooms/study.jpg',
    icon: Ruler,
    location: 'Đà Nẵng',
    projects: 64,
  },
];

export default function Partnerships() {
  const t = useTranslations();

  return (
    <section id="partners" className="py-10 sm:py-14 lg:py-20 bg-[#F9F7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D2D2D] mb-2 sm:mb-3">
            {t('partnerships.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#666] max-w-2xl mx-auto">
            {t('partnerships.description')}
          </p>
        </div>

        {/* Partners Grid - 1 col mobile, 2 tablet, 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-8 sm:mb-10">
          {partners.map((partner) => {
            const Icon = partner.icon;
            return (
              <div
                key={partner.name}
                className="group relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[#EBE5D9]"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={partner.image}
                    alt={partner.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  {/* Icon Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#2D5A3D]" />
                    </div>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="text-white font-semibold text-base sm:text-lg">{partner.name}</h3>
                    <p className="text-white/80 text-xs sm:text-sm">{partner.specialty}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[#666]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C4A35A]" />
                      <span>{partner.location}</span>
                    </div>
                    <span className="text-[#2D5A3D] font-medium">{partner.projects} {t('partnerships.projects')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="bg-[#2D5A3D] rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 text-center text-white">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3">
            {t('partnerships.ctaTitle')}
          </h3>
          <p className="text-white/80 text-sm sm:text-base mb-5 sm:mb-6 max-w-xl mx-auto">
            {t('partnerships.ctaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 bg-white text-[#2D5A3D] rounded-full font-medium hover:bg-[#F5F0E8] transition-colors text-sm sm:text-base">
              {t('partnerships.cta')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                0909 123 456
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                partner@nhaxinh.vn
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
