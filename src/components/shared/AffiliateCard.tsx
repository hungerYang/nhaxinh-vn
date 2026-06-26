'use client';

import { ExternalLink } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface AffiliateCardProps {
  image: string;
  name: string;
  price: number;
  originalPrice: number;
  affiliateUrl: string;
  category: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
}

export default function AffiliateCard({
  image,
  name,
  price,
  originalPrice,
  affiliateUrl,
}: AffiliateCardProps) {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <OptimizedImage
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary">
            {formatPrice(price)}
          </span>
          {originalPrice > price && (
            <span className="text-sm text-muted line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <a
          href={affiliateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Mua trên Shopee
        </a>
      </div>
    </div>
  );
}
