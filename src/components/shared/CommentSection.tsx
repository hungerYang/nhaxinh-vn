'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { Heart, MessageCircle, Send, Trash2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: string[];
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user, token } = useAuth();
  const t = useTranslations('comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  async function fetchComments() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/comments/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      } else {
        setError(t('loadFailed'));
      }
    } catch {
      setError(t('serviceUnavailable'));
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/comments/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function handleLike(commentId: string) {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: data.likes } : c));
      }
    } catch { /* ignore */ }
  }

  async function handleDelete(commentId: string) {
    if (!token) return;
    if (!confirm(t('confirmDelete'))) return;
    try {
      const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch { /* ignore */ }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return t('justNow');
    if (minutes < 60) return t('minutesAgo', { count: minutes });
    if (hours < 24) return t('hoursAgo', { count: hours });
    if (days < 30) return t('daysAgo', { count: days });
    return date.toLocaleDateString();
  }

  return (
    <section className="mt-12">
      <h3 className="text-2xl font-bold text-[#2D5A3D] mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6" />
        {t('comments', { count: comments.length })}
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#2D5A3D] text-white flex items-center justify-center text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t('placeholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/30 focus:border-[#2D5A3D] text-sm"
                rows={3}
                maxLength={1000}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2D5A3D] text-white rounded-lg text-sm font-medium hover:bg-[#234530] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? t('sending') : t('send')}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm">
          {t('loginRequired')}
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">{t('loading')}</div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-3">{error}</p>
          <button
            onClick={fetchComments}
            className="text-sm text-[#2D5A3D] hover:underline font-medium"
          >
            {t('retry')}
          </button>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">{t('noComments')}</div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {comment.userAvatar ? (
                  <img src={comment.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#C4A35A] text-white flex items-center justify-center text-sm font-bold">
                    {comment.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">{comment.userName}</span>
                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 text-xs ${comment.likes.includes(user?.id || '') ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-colors`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    {comment.likes.length > 0 && comment.likes.length}
                  </button>
                  {user && user.id === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('delete')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}