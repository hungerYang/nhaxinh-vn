'use client';

import { useTranslations } from 'next-intl';
import { Play, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { trackVideoPlay } from '@/lib/analytics';

type VideoPlatform = 'youtube' | 'tiktok' | 'facebook';

interface VideoItem {
  platform: VideoPlatform;
  videoId: string;
  videoUrl?: string;
  thumbnail: string;
  title: string;
  author: string;
  duration?: string;
}

const videos: VideoItem[] = [
  {
    platform: 'youtube',
    videoId: 'dQw4w9WgXcQ',
    thumbnail: '/nhaxinh-vn/images/video-1.jpg',
    title: 'Thiết kế phòng khách phong cách Đông Nam Á',
    author: 'NhàXinh Channel',
    duration: '12:34',
  },
  {
    platform: 'tiktok',
    videoId: '1234567890',
    thumbnail: '/nhaxinh-vn/images/video-2.jpg',
    title: 'Mẹo trang trí ban công nhỏ',
    author: '@nhaxinh_tips',
    duration: '0:45',
  },
  {
    platform: 'facebook',
    videoId: '123456789',
    videoUrl: 'https://www.facebook.com/facebook/videos/123456789',
    thumbnail: '/nhaxinh-vn/images/video-3.jpg',
    title: 'Before & After căn hộ 45m²',
    author: 'NhàXinh Community',
    duration: '8:20',
  },
];

const platformConfig = {
  youtube: {
    label: 'YouTube',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    getEmbedUrl: (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
  },
  tiktok: {
    label: 'TikTok',
    color: 'bg-black',
    textColor: 'text-black',
    getEmbedUrl: (id: string) => `https://www.tiktok.com/embed/${id}`,
  },
  facebook: {
    label: 'Facebook',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    getEmbedUrl: (id: string, url?: string) => {
      if (url) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
      return `https://www.facebook.com/video/embed?video_id=${id}`;
    },
  },
};

function VideoCard({ video, index }: { video: VideoItem; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const config = platformConfig[video.platform];
  const embedUrl = video.platform === 'facebook'
    ? config.getEmbedUrl(video.videoId, video.videoUrl)
    : config.getEmbedUrl(video.videoId);

  return (
    <div className="group flex-shrink-0 w-[85vw] sm:w-auto snap-start">
      <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900 shadow-sm">
        {!isPlaying ? (
          <>
            {/* Thumbnail */}
            {!imgError ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#2D5A3D] to-[#1E4530] flex items-center justify-center">
                <span className="text-white/60 text-sm px-4 text-center">{video.title}</span>
              </div>
            )}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

            {/* Platform Badge */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
              <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/90 backdrop-blur-sm">
                <div className={`w-2 h-2 rounded-full ${config.color}`} />
                <span className="text-xs font-medium text-foreground">{config.label}</span>
              </div>
            </div>

            {/* Duration */}
            {video.duration && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                <span className="px-2 py-0.5 bg-black/60 text-white text-xs rounded-md">
                  {video.duration}
                </span>
              </div>
            )}

            {/* Play Button - IKEA style centered */}
            <button
              onClick={() => {
                trackVideoPlay(video.title, video.platform);
                setIsPlaying(true);
              }}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Play video"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-[#2D5A3D] ml-0.5" fill="#2D5A3D" />
              </div>
            </button>

            {/* Video Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <h3 className="text-white font-medium text-sm sm:text-base line-clamp-1">{video.title}</h3>
              <p className="text-white/70 text-xs sm:text-sm mt-0.5">{video.author}</p>
            </div>
          </>
        ) : (
          <>
            {/* Close Button */}
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
              aria-label="Close video"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Video Player */}
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function VideoShowcase() {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-10 sm:py-14 lg:py-20 bg-[#F9F7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D2D2D] mb-2 sm:mb-3">
            {t('video.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#666] max-w-2xl mx-auto">
            {t('video.subtitle')}
          </p>
        </div>

        {/* Mobile: Horizontal scroll with snap; Desktop: Grid */}
        <div className="relative">
          {/* Mobile scroll container */}
          <div
            ref={scrollRef}
            className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2"
          >
            {videos.map((video, index) => (
              <VideoCard key={index} video={video} index={index} />
            ))}
          </div>

          {/* Mobile scroll indicators */}
          <div className="flex sm:hidden justify-center gap-1.5 mt-4">
            {videos.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#2D5A3D]/30" />
            ))}
          </div>
        </div>

        {/* View More Link */}
        <div className="text-center mt-6 sm:mt-8">
          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base text-[#2D5A3D] font-medium hover:underline"
          >
            {t('video.watchVideo')}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
