'use client';

import { Heart, User } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface UserSubmissionCardProps {
  coverImage: string;
  authorAvatar?: string;
  authorName: string;
  title: string;
  excerpt: string;
  roomType: string;
  likes: number;
}

export default function UserSubmissionCard({
  coverImage,
  authorAvatar,
  authorName,
  title,
  excerpt,
  roomType,
  likes,
}: UserSubmissionCardProps) {
  return (
    <div
      className="group relative bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <OptimizedImage
          src={coverImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* User Submission Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
            Ngườidùng đăng
          </span>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="px-6 py-2.5 bg-white text-foreground text-sm font-medium rounded-full hover:bg-white/90 transition-colors">
            Xem chi tiết
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted text-sm line-clamp-2 mb-4">
          {excerpt}
        </p>

        {/* Author & Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {authorAvatar ? (
              <div
                className="w-8 h-8 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${authorAvatar})` }}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <span className="text-sm text-foreground font-medium">{authorName}</span>
          </div>
          <div className="flex items-center gap-1 text-muted">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{likes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
