'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTranslations } from 'next-intl';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function ChatWidget() {
  const { user, token } = useAuth();
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && token) {
      loadConversations();
    }
  }, [isOpen, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // ignore
    }
  };

  const loadMessages = async (partnerId: string) => {
    if (!token) return;
    setLoading(true);
    setActiveConversation(partnerId);
    try {
      const res = await fetch(`${API_BASE}/api/messages/${partnerId}?page=1&limit=50`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const sendMessage = async () => {
    if (!token || !activeConversation || !newMessage.trim()) return;
    setSendingMessage(true);
    const content = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/messages/${activeConversation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
      }
    } catch {
      setNewMessage(content); // Restore on failure
    } finally {
      setSendingMessage(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goBack = () => {
    setActiveConversation(null);
    setMessages([]);
    loadConversations();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minutesAgo', { n: diffMins });
    if (diffHours < 24) return t('hoursAgo', { n: diffHours });
    if (diffDays < 7) return t('daysAgo', { n: diffDays });
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#2D5A3D] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              {activeConversation && (
                <button onClick={goBack} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">
                {activeConversation
                  ? conversations.find(c => c.partnerId === activeConversation)?.partnerName || t('title')
                  : t('title')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-green-200">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {t('online')}
              </span>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!activeConversation ? (
            /* Conversation List */
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6 text-center">
                  <MessageCircle className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">{t('noConversations')}</p>
                  <p className="text-xs mt-1">{t('noConversationsHint')}</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.partnerId}
                    onClick={() => loadMessages(conv.partnerId)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        {conv.partnerAvatar ? (
                          <img src={conv.partnerAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#2D5A3D]/10 flex items-center justify-center text-[#2D5A3D] font-semibold text-sm">
                            {conv.partnerName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800 truncate">{conv.partnerName}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                        {conv.unreadCount > 0 && (
                          <span className="ml-2 flex-shrink-0 w-5 h-5 bg-[#2D5A3D] text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            /* Messages View */
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {t('sendFirstMessage')}
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.fromUserId === user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-[#2D5A3D] text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-800 rounded-bl-md'
                        }`}>
                          <p className="break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('inputPlaceholder')}
                    className="flex-1 px-3 py-2 bg-gray-100 rounded-full text-sm outline-none focus:bg-gray-50 focus:ring-2 focus:ring-[#2D5A3D]/20 transition-colors"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="w-9 h-9 bg-[#2D5A3D] text-white rounded-full flex items-center justify-center hover:bg-[#1E4530] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#2D5A3D] text-white rounded-full shadow-lg hover:bg-[#1E4530] transition-all hover:scale-105 flex items-center justify-center group"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && !isOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 9 ? '9+' : conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}
