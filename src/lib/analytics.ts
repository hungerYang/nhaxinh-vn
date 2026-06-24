// Google Analytics 4 event tracking utilities
// Safe to call even if GA is not loaded

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    });
  }
};

// Predefined events for NhàXinh.vn
export const trackSearch = (query: string, resultCount: number) => {
  trackEvent('search', { search_term: query, result_count: resultCount });
};

export const trackLike = (articleId: string, articleTitle: string) => {
  trackEvent('like_article', { article_id: articleId, article_title: articleTitle });
};

export const trackShare = (articleId: string, platform: string) => {
  trackEvent('share_article', { article_id: articleId, platform });
};

export const trackFavorite = (articleId: string) => {
  trackEvent('favorite_article', { article_id: articleId });
};

export const trackLanguageSwitch = (from: string, to: string) => {
  trackEvent('language_switch', { from_locale: from, to_locale: to });
};

export const trackSubmitArticle = () => {
  trackEvent('submit_article');
};

export const trackVideoPlay = (videoTitle: string, platform: string) => {
  trackEvent('video_play', { video_title: videoTitle, platform });
};

export const trackAffiliateClick = (productId: string, productName: string) => {
  trackEvent('affiliate_click', { product_id: productId, product_name: productName });
};
