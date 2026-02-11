import { useState, useEffect } from 'react';

const MAX_HISTORY_ITEMS = 20;
const STORAGE_KEY = 'lyrics-explainer-history';

export function useSearchHistory() {
  const [history, setHistory] = useState([]);

  // 初期化：LocalStorageから履歴を読み込む
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // 履歴に追加
  const addToHistory = (title, artist) => {
    const newItem = {
      id: Date.now().toString(),
      title,
      artist,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => {
      // 重複チェック：同じ曲名とアーティストの組み合わせは削除
      const filtered = prev.filter(
        (item) =>
          !(item.title.toLowerCase() === title.toLowerCase() &&
            item.artist.toLowerCase() === artist.toLowerCase())
      );

      // 新しいアイテムを先頭に追加し、最大数を超えたら古いものを削除
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // LocalStorageに保存
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }

      return updated;
    });
  };

  // 個別削除
  const removeFromHistory = (id) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to update search history:', error);
      }

      return updated;
    });
  };

  // 全削除
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
