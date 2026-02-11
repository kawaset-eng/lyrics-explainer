import { useState, useEffect } from 'react';

export default function Recommendations({ title, artist, interpretation, onSelectSong }) {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, artist, interpretation }),
        });

        if (!res.ok) {
          throw new Error('レコメンドの取得に失敗しました');
        }

        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (title && artist) {
      fetchRecommendations();
    }
  }, [title, artist, interpretation]);

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
          <span className="text-2xl">🎵</span> この曲が好きなあなたへ
        </h2>
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="mt-2 text-sm text-gray-500">おすすめの曲を探しています...</p>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="text-2xl">🎵</span> この曲が好きなあなたへ
      </h2>

      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            onClick={() => onSelectSong && onSelectSong({ title: rec.title, artist: rec.artist })}
            className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {rec.title}
                </div>
                <div className="text-sm text-gray-600 mb-1">{rec.artist}</div>
                <div className="text-sm text-gray-500 leading-relaxed">
                  {rec.reason}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
