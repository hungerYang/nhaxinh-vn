'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Menu, X, Globe, Bookmark, ChevronDown, User, LogOut } from 'lucide-react';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { useFavorites } from '@/hooks/useFavorites';
import { trackLanguageSwitch } from '@/lib/analytics';
import { useAuth } from '@/components/auth/AuthProvider';

const SearchOverlay = dynamic(() => import('@/components/shared/SearchOverlay'));
const LoginModal = dynamic(() => import('@/components/auth/LoginModal'));
const AvatarSelector = dynamic(() => import('@/components/auth/AvatarSelector'));

export default function Header() {
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string>('');
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();
  const { user, logout, token, updateProfile } = useAuth();

  // Sync avatar from user
  useEffect(() => {
    if (user?.avatar) {
      setLocalAvatar(user.avatar);
    }
  }, [user?.avatar]);

  async function handleAvatarChange(avatarUrl: string) {
    setLocalAvatar(avatarUrl);
    if (token && updateProfile) {
      try {
        await updateProfile({ avatar: avatarUrl });
      } catch { /* ignore */ }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute locale switch URL for a given target locale
  const basePath = '';
  const getLocaleUrl = useMemo(() => {
    return (targetLocale: string) => {
      let currentPath = pathname || '/';
      // Remove basePath prefix if present
      if (currentPath.startsWith(basePath)) {
        currentPath = currentPath.slice(basePath.length) || '/';
      }
      // Remove locale prefix from path
      if (currentPath.startsWith(`/${locale}/`)) {
        currentPath = currentPath.slice(`/${locale}`.length);
      } else if (currentPath === `/${locale}` || currentPath === `/${locale}/`) {
        currentPath = '/';
      }
      // Ensure path starts with /
      if (!currentPath.startsWith('/')) {
        currentPath = '/' + currentPath;
      }
      // For root path, just return /basePath/{locale}/
      if (currentPath === '/') {
        return `${basePath}/${targetLocale}/`;
      }
      // Remove trailing slash to avoid double slashes, then add it back
      const cleanPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
      return `${basePath}/${targetLocale}${cleanPath}/`;
    };
  }, [locale, pathname]);

  const navLinks = [
    { label: t('home'), href: `/${locale}/` },
    { label: t('styles'), href: `/${locale}/#content-cards` },
    { label: t('rooms'), href: `/${locale}/#rooms` },
    { label: t('partners'), href: `/${locale}/#partners` },
  ];

  const textColor = scrolled ? 'text-foreground' : 'text-white';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href={`/${locale}/`} className="flex items-center gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-[#2D5A3D]">NX</span>
            <span className={`hidden sm:inline text-lg font-semibold ${textColor}`}>
              NhàXinh.vn
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#2D5A3D] ${textColor}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User Auth Button / Menu */}
            {user ? (
              <div ref={userMenuRef} className="relative flex items-center gap-2">
                <AvatarSelector
                  currentAvatar={localAvatar}
                  onAvatarChange={handleAvatarChange}
                  token={token || ''}
                />
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-black/10 ${textColor}`}
                >
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {tAuth('profile')}
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {tAuth('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setLoginModalOpen(true)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-black/10 ${textColor}`}
              >
                {tAuth('loginButton')}
              </button>
            )}

            {/* Favorites Button */}
            <Link
              href={`/${locale}/favorites`}
              className={`relative p-2 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
              aria-label="Favorites"
            >
              <Bookmark className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C45C3E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>

            {/* Search Button */}
            <button
              onClick={() => setSearchOverlayOpen(true)}
              className={`p-2 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Switcher - CSS Hover Dropdown (works without JS) */}
            <div className="relative hidden sm:block group">
              <button
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:bg-black/10 ${textColor}`}
                aria-label="Switch language"
              >
                <Globe className="w-4 h-4" />
                <span>{locale.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
              </button>

              {/* Dropdown - CSS hover triggered */}
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {locales.map((loc) => (
                  <a
                    key={loc}
                    href={getLocaleUrl(loc)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      loc === locale
                        ? 'bg-[#2D5A3D]/10 text-[#2D5A3D] font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs font-medium text-gray-400 uppercase">{loc}</span>
                    <span>{localeNames[loc]}</span>
                    {loc === locale && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2D5A3D]" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full transition-colors hover:bg-black/10 ${textColor}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-foreground rounded-lg hover:bg-[#2D5A3D]/10 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t my-1" />
            {/* Language options in mobile menu */}
            <div className="px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-2">
                <Globe className="w-3.5 h-3.5" />
                <span>Language / Ngôn ngữ</span>
              </div>
              <div className="flex gap-2">
                {locales.map((loc) => (
                  <a
                    key={loc}
                    href={getLocaleUrl(loc)}
                    onClick={() => {
                      trackLanguageSwitch(locale, loc);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      loc === locale
                        ? 'bg-[#2D5A3D] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-xs text-gray-400 uppercase">{loc}</div>
                    <div className="text-sm">{localeNames[loc]}</div>
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={searchOverlayOpen}
        onClose={() => setSearchOverlayOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </header>
  );
}
