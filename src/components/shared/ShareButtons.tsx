'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Share2, Link2, Check, X } from 'lucide-react';
import { trackShare } from '@/lib/analytics';

interface ShareButtonsProps {
  title: string;
  description: string;
  articleId?: string;
}

// Simple SVG icons for platforms
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.03 2 11c0 2.76 1.36 5.23 3.5 6.86V22l4.09-2.24c.78.15 1.58.24 2.41.24 5.52 0 10-4.03 10-9s-4.48-9-10-9zm4.91 7.5l-1.82 3.5h-1.5l.91-1.75h-2.5l-1.82 3.5h-1.5l.91-1.75H7.59l.91-1.75h2.5l.91-1.75h1.5l-.91 1.75h2.5l.91-1.75h1.5z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareButtons({ title, description, articleId = '' }: ShareButtonsProps) {
  const t = useTranslations('share');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'bg-[#1877F2] hover:bg-[#166fe5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    },
    {
      name: 'Zalo',
      icon: ZaloIcon,
      color: 'bg-[#0068FF] hover:bg-[#005ce6]',
      url: `https://zalo.me/share?u=${encodedUrl}&t=${encodedTitle}`,
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: 'bg-[#000000] hover:bg-[#333333]',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5F0E8] text-[#2D5A3D] rounded-full font-medium hover:bg-[#EBE5D9] transition-colors"
      >
        <Share2 className="w-5 h-5" />
        {t('share')}
      </button>

      {/* Share Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-[#EBE5D9] p-4 w-72">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#2D2D2D]">{t('shareTitle')}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-[#F5F0E8] transition-colors"
              >
                <X className="w-4 h-4 text-[#999]" />
              </button>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackShare(articleId, link.name)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-white transition-colors ${link.color}`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{link.name}</span>
                </a>
              ))}
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-[#F9F7F2] rounded-lg text-xs text-[#666] truncate">
                {shareUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  copied
                    ? 'bg-[#2D5A3D] text-white'
                    : 'bg-[#F5F0E8] text-[#2D5A3D] hover:bg-[#EBE5D9]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    {t('copy')}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
