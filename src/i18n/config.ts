export const locales = ['vi', 'zh', 'en'] as const;
export const defaultLocale = 'vi' as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  zh: '中文',
  en: 'English',
};
