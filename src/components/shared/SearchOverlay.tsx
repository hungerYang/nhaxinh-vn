'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search, X, ArrowRight } from 'lucide-react';
import Fuse from 'fuse.js';
import { getAllSearchableItems, SearchableItem } from '@/data/searchData';
import { trackSearch } from '@/lib/analytics';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const t = useTranslations('search');
  const locale = useLocale();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchableItem[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchableItem> | null>(null);

  // Initialize Fuse.js
  useEffect(() => {
    const items = getAllSearchableItems();
    const fuseInstance = new Fuse(items, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'author', weight: 0.5 },
        { name: 'category', weight: 0.5 },
        { name: 'style', weight: 0.8 },
        { name: 'room', weight: 0.8 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
    setFuse(fuseInstance);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (!fuse || !value.trim()) {
        setResults([]);
        return;
      }
      const searchResults = fuse.search(value.trim()).slice(0, 12);
      setResults(searchResults.map((r) => r.item));
      trackSearch(value.trim(), searchResults.length);
    },
    [fuse]
  );

  // Navigate to result
  const handleResultClick = (item: SearchableItem) => {
    onClose();
    if (item.type === 'product') {
      window.open('https://shopee.vn', '_blank');
    } else {
      router.push(`/${locale}/article/${item.id}/`);
    }
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const typeLabels: Record<string, string> = {
    article: t('typeArticle'),
    submission: t('typeSubmission'),
    product: t('typeProduct'),
  };

  const typeColors: Record<string, string> = {
    article: 'bg-[#2D5A3D]',
    submission: 'bg-[#C4A35A]',
    product: 'bg-[#C45C3E]',
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Panel */}
      <div className="relative w-full max-w-2xl mx-auto mt-16 sm:mt-20 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-[#EBE5D9]">
            <Search className="w-5 h-5 text-[#999] flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              className="flex-1 text-base sm:text-lg outline-none bg-transparent text-[#2D2D2D] placeholder:text-[#999]"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full hover:bg-[#F5F0E8] transition-colors"
              >
                <X className="w-4 h-4 text-[#999]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm text-[#999] hover:text-[#2D2D2D] border border-[#EBE5D9] rounded-lg transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query && results.length === 0 && (
              <div className="px-5 py-10 text-center">
                <p className="text-[#999] text-sm">{t('noResults')}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                <div className="px-4 sm:px-5 py-2">
                  <span className="text-xs text-[#999] font-medium">
                    {results.length} {t('resultCount')}
                  </span>
                </div>
                {results.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleResultClick(item)}
                    className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 hover:bg-[#F9F7F2] transition-colors text-left"
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-[#F5F0E8] flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-1.5 py-0.5 text-white text-[10px] font-medium rounded ${typeColors[item.type]}`}>
                          {typeLabels[item.type]}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-[#2D2D2D] truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#999] truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-4 h-4 text-[#CCC] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {!query && (
              <div className="px-5 py-10 text-center">
                <Search className="w-10 h-10 text-[#E0D8CC] mx-auto mb-3" />
                <p className="text-[#999] text-sm">{t('hint')}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {(t.raw('suggestedTags') as string[]).map((tag: string) => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className="px-3 py-1.5 text-xs bg-[#F5F0E8] text-[#666] rounded-full hover:bg-[#EBE5D9] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
