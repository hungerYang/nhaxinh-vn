'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Upload, Camera, X, Check, ArrowLeft, ImagePlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { trackSubmitArticle } from '@/lib/analytics';
import { useAuth } from '@/components/auth/AuthProvider';

const ROOM_OPTIONS = [
  { value: 'living', labelKey: 'livingRoom' },
  { value: 'bedroom', labelKey: 'bedroom' },
  { value: 'kitchen', labelKey: 'kitchen' },
  { value: 'dining', labelKey: 'diningRoom' },
  { value: 'balcony', labelKey: 'balcony' },
  { value: 'study', labelKey: 'study' },
  { value: 'bathroom', labelKey: 'bathroom' },
  { value: 'entryway', labelKey: 'entryway' },
];

const STYLE_OPTIONS = [
  { value: 'se-asia', labelKey: 'seAsia' },
  { value: 'french', labelKey: 'french' },
  { value: 'minimalist', labelKey: 'minimalist' },
  { value: 'modern', labelKey: 'modern' },
  { value: 'vintage', labelKey: 'vintage' },
  { value: 'other', labelKey: 'other' },
];

export default function SubmitForm() {
  const t = useTranslations('submit');
  const tRooms = useTranslations('rooms');
  const locale = useLocale();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    authorName: '',
    email: '',
    room: '',
    style: '',
    description: '',
    tips: '',
  });

  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill author name from logged-in user
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, authorName: user.name }));
    }
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageAdd = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = localStorage.getItem('user_token');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (images.length + i >= 5) break;
      if (file.size > 5 * 1024 * 1024) continue;

      // Create local preview
      const previewUrl = URL.createObjectURL(file);
      setImages(prev => [...prev, previewUrl]);
      setImageFiles(prev => [...prev, file]);

      // Upload to server
      if (token) {
        try {
          setUploading(true);
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          const data = await res.json();
          if (data.success) {
            // Replace preview URL with server URL
            setImages(prev => prev.map(url => url === previewUrl ? data.url : url));
          }
        } catch {
          // Keep preview URL even if upload fails
        } finally {
          setUploading(false);
        }
      }
    }
    // Reset file input
    e.target.value = '';
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = t('errorTitle');
    if (!formData.authorName.trim()) newErrors.authorName = t('errorAuthor');
    if (!formData.email.trim()) newErrors.email = t('errorEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('errorEmailInvalid');
    if (!formData.room) newErrors.room = t('errorRoom');
    if (!formData.style) newErrors.style = t('errorStyle');
    if (!formData.description.trim()) newErrors.description = t('errorDescription');
    if (images.length === 0) newErrors.images = t('errorImages');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = localStorage.getItem('user_token');

    // Upload any remaining files that haven't been uploaded yet
    const finalImages = [...images];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      if (token && !finalImages[i].startsWith('blob:')) continue; // Already uploaded
      if (token) {
        try {
          const uploadForm = new FormData();
          uploadForm.append('image', file);
          const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: uploadForm,
          });
          const data = await res.json();
          if (data.success) {
            finalImages[i] = data.url;
          }
        } catch {
          // ignore
        }
      }
    }

    // POST to API if logged in
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/api/submissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            images: finalImages,
            image: finalImages[0] || '',
          }),
        });
        if (res.ok) {
          trackSubmitArticle();
          setSubmitted(true);
          return;
        }
      } catch {
        // Fall through to console.log
      }
    }

    trackSubmitArticle();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#2D5A3D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] mb-3">{t('successTitle')}</h1>
          <p className="text-[#666] mb-8 leading-relaxed">{t('successMessage')}</p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D5A3D] text-white rounded-full font-medium hover:bg-[#1E4530] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backHome')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#2D5A3D] text-white py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backHome')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('title')}</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-[#2D2D2D] mb-2">
              {t('images')} <span className="text-[#C45C3E]">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#F5F0E8]">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${img})` }}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={handleImageAdd}
                  className="aspect-square rounded-xl border-2 border-dashed border-[#D0C8B8] flex flex-col items-center justify-center gap-1.5 text-[#999] hover:border-[#2D5A3D] hover:text-[#2D5A3D] transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <ImagePlus className="w-6 h-6" />
                  )}
                  <span className="text-xs">{t('addImage')}</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            {errors.images && (
              <p className="text-[#C45C3E] text-xs mt-2">{errors.images}</p>
            )}
            <p className="text-[#999] text-xs mt-2">{t('imagesHint')}</p>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-[#2D2D2D] mb-2">
              {t('titleLabel')} <span className="text-[#C45C3E]">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('titlePlaceholder')}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                errors.title ? 'border-[#C45C3E] bg-red-50/50' : 'border-[#D0C8B8] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20'
              }`}
            />
            {errors.title && <p className="text-[#C45C3E] text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Author & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="authorName" className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                {t('authorName')} <span className="text-[#C45C3E]">*</span>
              </label>
              <input
                id="authorName"
                name="authorName"
                type="text"
                value={formData.authorName}
                onChange={handleChange}
                placeholder={t('authorPlaceholder')}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                  errors.authorName ? 'border-[#C45C3E] bg-red-50/50' : 'border-[#D0C8B8] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20'
                }`}
              />
              {errors.authorName && <p className="text-[#C45C3E] text-xs mt-1">{errors.authorName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                {t('email')} <span className="text-[#C45C3E]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('emailPlaceholder')}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                  errors.email ? 'border-[#C45C3E] bg-red-50/50' : 'border-[#D0C8B8] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20'
                }`}
              />
              {errors.email && <p className="text-[#C45C3E] text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Room & Style Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="room" className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                {t('room')} <span className="text-[#C45C3E]">*</span>
              </label>
              <select
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors appearance-none bg-white ${
                  errors.room ? 'border-[#C45C3E] bg-red-50/50' : 'border-[#D0C8B8] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20'
                }`}
              >
                <option value="">{t('selectRoom')}</option>
                {ROOM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {tRooms(opt.labelKey)}
                  </option>
                ))}
              </select>
              {errors.room && <p className="text-[#C45C3E] text-xs mt-1">{errors.room}</p>}
            </div>
            <div>
              <label htmlFor="style" className="block text-sm font-semibold text-[#2D2D2D] mb-2">
                {t('style')} <span className="text-[#C45C3E]">*</span>
              </label>
              <select
                id="style"
                name="style"
                value={formData.style}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors appearance-none bg-white ${
                  errors.style ? 'border-[#C45C3E] bg-red-50/50' : 'border-[#D0C8B8] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20'
                }`}
              >
                <option value="">{t('selectStyle')}</option>
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </option>
                ))}
              </select>
              {errors.style && <p className="text-[#C45C3E] text-xs mt-1">{errors.style}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#2D2D2D] mb-2">
              {t('description')} <span className="text-[#C45C3E]">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('descriptionPlaceholder')}
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors resize-none ${
                errors.description ? 'border-[#C45C3E] bg-red-50/50' : 'border-[#D0C8B8] focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20'
              }`}
            />
            {errors.description && <p className="text-[#C45C3E] text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Tips (optional) */}
          <div>
            <label htmlFor="tips" className="block text-sm font-semibold text-[#2D2D2D] mb-2">
              {t('tips')} <span className="text-[#999] font-normal">({t('optional')})</span>
            </label>
            <textarea
              id="tips"
              name="tips"
              value={formData.tips}
              onChange={handleChange}
              placeholder={t('tipsPlaceholder')}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#D0C8B8] text-sm outline-none transition-colors resize-none focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20"
            />
          </div>

          {/* Guidelines */}
          <div className="bg-[#F9F7F2] rounded-xl p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-[#2D2D2D] mb-3">{t('guidelinesTitle')}</h3>
            <ul className="space-y-2 text-sm text-[#666]">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2D5A3D] mt-0.5 flex-shrink-0" />
                {t('guideline1')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2D5A3D] mt-0.5 flex-shrink-0" />
                {t('guideline2')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2D5A3D] mt-0.5 flex-shrink-0" />
                {t('guideline3')}
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#2D5A3D] mt-0.5 flex-shrink-0" />
                {t('guideline4')}
              </li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 sm:py-4 bg-[#2D5A3D] text-white rounded-xl font-semibold text-base hover:bg-[#1E4530] transition-colors shadow-lg shadow-[#2D5A3D]/20"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
