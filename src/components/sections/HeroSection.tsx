'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HoverRevealCard from '../shared/HoverRevealCard';

const slides = [
  {
    image: '/nhaxinh-vn/images/hero/hero-1.jpg',
    bgGradient: 'from-[#2D5A3D] to-[#1a3d2a]',
    titleKey: 'slide1.title',
    descriptionKey: 'slide1.description',
    ctaKey: 'slide1.cta',
    links: [
      { label: '', href: '#', variant: 'primary' as const },
      { label: '', href: '#', variant: 'secondary' as const },
    ],
  },
  {
    image: '/nhaxinh-vn/images/hero/hero-2.jpg',
    bgGradient: 'from-[#8B7355] to-[#5c4a35]',
    titleKey: 'slide2.title',
    descriptionKey: 'slide2.description',
    ctaKey: 'slide2.cta',
    links: [
      { label: '', href: '#', variant: 'primary' as const },
      { label: '', href: '#', variant: 'secondary' as const },
    ],
  },
  {
    image: '/nhaxinh-vn/images/hero/hero-3.jpg',
    bgGradient: 'from-[#C4A35A] to-[#8a7040]',
    titleKey: 'slide3.title',
    descriptionKey: 'slide3.description',
    ctaKey: 'slide3.cta',
    links: [
      { label: '', href: '#', variant: 'primary' as const },
    ],
  },
];

export default function HeroSection() {
  const t = useTranslations('hero');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const currentSlideData = slides[currentSlide];
  const links = currentSlideData.links.map((link, index) => ({
    ...link,
    label: t(currentSlideData.ctaKey),
  }));

  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] lg:h-[85vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: isLoaded ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <HoverRevealCard
            image={currentSlideData.image}
            bgGradient={currentSlideData.bgGradient}
            title={t(currentSlideData.titleKey)}
            description={t(currentSlideData.descriptionKey)}
            links={links}
            overlayOpacity={0.3}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-6 sm:w-8 bg-white'
                : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
