'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, X, MessageCircle } from 'lucide-react';

type VideoPlatform = 'youtube' | 'tiktok' | 'douyin' | 'facebook' | 'telegram';

interface VideoEmbedProps {
  platform: VideoPlatform;
  videoId: string;
  videoUrl?: string;
  thumbnail?: string;
  title?: string;
  author?: string;
}

const platformConfig = {
  youtube: {
    icon: () => (
      <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    color: 'text-red-600',
    bgColor: 'bg-red-600',
    getEmbedUrl: (id: string) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
    getThumbnail: (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  },
  tiktok: {
    icon: () => (
      <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    color: 'text-black',
    bgColor: 'bg-black',
    getEmbedUrl: (id: string) => `https://www.tiktok.com/embed/${id}`,
    getThumbnail: () => '',
  },
  douyin: {
    icon: () => (
      <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    color: 'text-black',
    bgColor: 'bg-black',
    getEmbedUrl: (id: string) => `https://open.douyin.com/player/video?vid=${id}`,
    getThumbnail: () => '',
  },
  facebook: {
    icon: () => (
      <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'text-blue-600',
    bgColor: 'bg-blue-600',
    getEmbedUrl: (id: string, url?: string) => {
      if (url) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
      return `https://www.facebook.com/video/embed?video_id=${id}`;
    },
    getThumbnail: () => '',
  },
  telegram: {
    icon: () => (
      <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    getEmbedUrl: (id: string) => `https://t.me/${id}`,
    getThumbnail: () => '',
  },
};

export default function VideoEmbed({
  platform,
  videoId,
  videoUrl,
  thumbnail: customThumbnail,
  title,
  author,
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = platformConfig[platform];
  const PlatformIcon = config.icon;
  const thumbnail = customThumbnail || config.getThumbnail(videoId);
  const embedUrl = config.getEmbedUrl(videoId, videoUrl);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900">
        {!isLoaded ? (
          <>
            {/* Thumbnail */}
            {isInView && thumbnail && (
              <img
                src={thumbnail}
                alt={title || 'Video thumbnail'}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            )}
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Platform Badge */}
            <div className="absolute top-3 left-3 z-10">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm`}>
                <PlatformIcon />
                <span className="text-xs font-medium text-foreground capitalize">{platform}</span>
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={() => setIsLoaded(true)}
              className="absolute inset-0 flex items-center justify-center group"
            >
              <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              </div>
            </button>

            {/* Video Info */}
            {(title || author) && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                {title && <p className="text-white font-medium text-sm">{title}</p>}
                {author && <p className="text-white/70 text-xs mt-1">{author}</p>}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Close Button */}
            <button
              onClick={() => setIsLoaded(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Video Player */}
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </>
        )}
      </div>
    </div>
  );
}
