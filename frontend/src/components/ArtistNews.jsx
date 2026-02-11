import { useState, useEffect } from 'react';

export default function ArtistNews({ artist }) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/artist-trivia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artist }),
        });

        if (!res.ok) {
          throw new Error('情報の取得に失敗しました');
        }

        const data = await res.json();
        setNews(data.trivia || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (artist) {
      fetchNews();
    }
  }, [artist]);

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span className="text-2xl">💡</span> {artist} の豆知識
        </h2>
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="mt-2 text-sm text-gray-500">情報を取得中...</p>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="text-2xl">💡</span> {artist} の豆知識
      </h2>

      <div className="space-y-3">
        {news.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
          >
            <p className="text-sm text-gray-700 leading-relaxed">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
