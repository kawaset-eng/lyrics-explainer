import { useState } from "react";
import SearchForm from "./components/SearchForm";
import SearchHistory from "./components/SearchHistory";
import LyricsDisplay from "./components/LyricsDisplay";
import Translation from "./components/Translation";
import Interpretation from "./components/Interpretation";
import ArtistInfo from "./components/ArtistInfo";
import ChatSection from "./components/ChatSection";
import { useSearchHistory } from "./hooks/useSearchHistory";

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { history, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();

  const handleSearch = async ({ title, artist }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, artist }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "歌詞情報の取得に失敗しました");
      }

      const data = await res.json();
      setResult(data);

      // 検索成功時に履歴に追加
      addToHistory(title, artist);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (title, artist) => {
    handleSearch({ title, artist });
  };

  const handleBackToHome = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <h1
            onClick={handleBackToHome}
            className="text-2xl font-bold text-gray-900 text-center mb-1 cursor-pointer hover:text-indigo-600 transition-colors"
          >
            Lyrics Explainer
          </h1>
          <p className="text-center text-gray-500 text-sm">
            洋楽の歌詞を理解しよう
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        <SearchHistory
          history={history}
          onSelectHistory={handleSelectHistory}
          onRemoveHistory={removeFromHistory}
          onClearHistory={clearHistory}
          isVisible={!isLoading && !result}
        />

        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">
              AI が歌詞を分析中です...（10〜15秒ほどかかります）
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* タイトル */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">
                {result.title}
              </h2>
              <p className="text-gray-500">{result.artist}</p>
            </div>

            {/* 歌詞 + 日本語訳（横並び） */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LyricsDisplay
                lyrics={result.lyrics}
                geniusUrl={result.geniusUrl}
              />
              <Translation translation={result.translation} />
            </div>

            {/* 解釈・意味 */}
            <Interpretation interpretation={result.interpretation} />

            {/* 曲の背景 + アーティスト情報 */}
            <ArtistInfo
              background={result.background}
              artistInfo={result.artistInfo}
              artist={result.artist}
            />

            {/* チャット */}
            <ChatSection songContext={result} />
          </div>
        )}

        {!result && !isLoading && !error && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">&#9835;</p>
            <p>曲名とアーティスト名を入力して検索してください</p>
          </div>
        )}
      </main>
    </div>
  );
}
