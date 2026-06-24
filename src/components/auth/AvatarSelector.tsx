'use client';
import { useState } from 'react';
import { Camera } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const PRESET_AVATARS = [
  '/avatars/avatar-1.svg', '/avatars/avatar-2.svg', '/avatars/avatar-3.svg',
  '/avatars/avatar-4.svg', '/avatars/avatar-5.svg', '/avatars/avatar-6.svg',
  '/avatars/avatar-7.svg', '/avatars/avatar-8.svg', '/avatars/avatar-9.svg',
  '/avatars/avatar-10.svg', '/avatars/avatar-11.svg', '/avatars/avatar-12.svg',
];

interface AvatarSelectorProps {
  currentAvatar: string;
  onAvatarChange: (avatarUrl: string) => void;
  token: string;
}

export default function AvatarSelector({ currentAvatar, onAvatarChange, token }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch(`${API_BASE}/api/upload/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        onAvatarChange(data.url);
      }
    } catch { /* ignore */ }
    setUploading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow">
          {currentAvatar ? (
            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#2D5A3D] text-white flex items-center justify-center text-sm font-bold">?</div>
          )}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera className="w-4 h-4 text-white" />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-xl border p-4 w-72">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">选择头像</h4>

            {/* Preset avatars grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {PRESET_AVATARS.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => { onAvatarChange(avatar); setIsOpen(false); }}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${
                    currentAvatar === avatar ? 'border-[#2D5A3D]' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={avatar} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Upload custom avatar */}
            <div className="border-t pt-3">
              <label className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm text-gray-600">
                <Camera className="w-4 h-4" />
                {uploading ? '上传中...' : '上传自定义头像'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
