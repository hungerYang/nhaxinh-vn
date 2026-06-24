'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nhaxinh_likes';

export function useLikes() {
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLikes(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(likes));
    }
  }, [likes, isReady]);

  const toggleLike = useCallback((id: string) => {
    setLikes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const isLiked = useCallback(
    (id: string) => !!likes[id],
    [likes]
  );

  return { likes, toggleLike, isLiked, isReady };
}
