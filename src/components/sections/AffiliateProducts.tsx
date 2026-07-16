'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ExternalLink, ShoppingBag, ArrowRight } from 'lucide-react';
import OptimizedImage from '@/components/shared/OptimizedImage';
import products from '@/data/products.json';
import { trackAffiliateClick } from '@/lib/analytics';

type CategoryFilter = 'all' | 'furniture' | 'decor' | 'materials' | 'lighting';

// Platform color and label configuration
const platformConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  shopee: { color: '#EE4D2D', bgColor: 'rgba(238, 77, 45, 0.1)', label: 'Shopee' },
  lazada: { color: '#0F146D', bgColor: 'rgba(15, 20, 109, 0.1)', label: 'Lazada' },
  tiktok: { color: '#000000', bgColor: 'rgba(0, 0, 0, 0.08)', label: 'TikTok Shop' },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price);
}

// Build buy links for a product - supports multiple platforms
function getBuyLinks(product: typeof products[0]) {
  const links: { url: string; platform: string; isAffiliate: boolean }[] = [];

  // Primary affiliate link
  if (product.affiliateUrl && product.affiliateEnabled) {
    links.push({
      url: product.affiliateUrl,
      platform: product.platform || 'shopee',
      isAffiliate: true,
    });
  }

  // Fallback to shopeeUrl if no affiliate link
  if (links.length === 0 && product.shopeeUrl) {
    links.push({
      url: product.shopeeUrl,
      platform: 'shopee',
      isAffiliate: false,
    });
  }

  return links;
}

export default function AffiliateProducts() {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: t('content.filterAll') },
    { key: 'furniture', label: t('affiliate.filterFurniture') },
    { key: 'decor', label: t('affiliate.filterDecor') },
    { key: 'materials', label: t('affiliate.filterMaterials') },
    { key: 'lighting', label: t('affiliate.filterLighting') },
  ];

  return (
    <section className="py-10 sm:py-14 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D2D2D] mb-2 sm:mb-3">
            {t('affiliate.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#666] max-w-2xl mx-auto">
            {t('affiliate.subtitle')}
          </p>
        </div>

        {/* Category Filters - horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-[#2D5A3D] text-white shadow-md'
                  : 'bg-[#F5F0E8] text-[#555] hover:bg-[#EBE5D9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid - 2 cols mobile, 3 tablet, 4 desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {filteredProducts.map((product) => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            const buyLinks = getBuyLinks(product);
            const isAffiliate = product.affiliateEnabled && !!product.affiliateUrl;
            const platform = product.platform || 'shopee';
            const platformInfo = platformConfig[platform] || platformConfig.shopee;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-[#EBE5D9] hover:shadow-lg transition-shadow"
              >
                {/* Image with IKEA-style hover */}
                <div className="relative aspect-square overflow-hidden bg-[#F5F0E8]">
                  <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        -{discount}%
                      </span>
                    </div>
                  )}

                  {/* Ad Label - 广告 */}
                  {isAffiliate && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="px-1.5 py-0.5 bg-gray-800 text-white text-[10px] font-medium rounded">
                        {t('affiliate.adLabel')}
                      </span>
                    </div>
                  )}

                  {/* Platform Badge */}
                  {buyLinks.length > 0 && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span
                        className="inline-flex items-center px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full"
                        style={{
                          color: platformInfo.color,
                          backgroundColor: platformInfo.bgColor,
                        }}
                      >
                        {platformInfo.label}
                      </span>
                    </div>
                  )}

                  {/* IKEA-style hover overlay with CTA - hidden on touch devices */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#2D5A3D] rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      {t('affiliate.buyNow')}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-2.5 sm:p-3 lg:p-4">
                  <h3 className="font-medium text-[#2D2D2D] text-xs sm:text-sm mb-1.5 line-clamp-2 group-hover:text-[#2D5A3D] transition-colors leading-snug">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <span className="text-sm sm:text-base font-bold text-[#C45C3E]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-xs text-[#999] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Buy Links - supports multiple platforms */}
                  {buyLinks.length === 1 ? (
                    <a
                      href={buyLinks[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAffiliateClick(product.id, product.name)}
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-[#2D5A3D] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#1E4530] transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{t('affiliate.buyNow')}</span>
                      <span className="sm:hidden">{t('affiliate.buyMobile')}</span>
                    </a>
                  ) : (
                    <div className="space-y-1.5">
                      {buyLinks.map((link, idx) => {
                        const linkPlatform = platformConfig[link.platform] || platformConfig.shopee;
                        return (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackAffiliateClick(product.id, product.name)}
                            className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: linkPlatform.bgColor,
                              color: linkPlatform.color,
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{linkPlatform.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}

                  {/* Affiliate Disclosure */}
                  {isAffiliate && (
                    <p className="mt-1.5 text-[10px] text-[#999] leading-tight text-center">
                      {t('affiliate.affiliateLink')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual separator before footer */}
        <div className="mt-8 sm:mt-10 border-b border-gray-100" />
      </div>
    </section>
  );
}
