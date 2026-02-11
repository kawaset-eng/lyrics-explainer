import { useState } from "react";

export default function SearchForm({ onSearch, isLoading }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && artist.trim()) {
      onSearch({ title: title.trim(), artist: artist.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white">
        <input
          type="text"
          placeholder="曲名 (例: All You Need Is Love)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white transition-all"
        />
        <input
          type="text"
          placeholder="アーティスト名 (例: The Beatles)"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !title.trim() || !artist.trim()}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isLoading ? "検索中..." : "🔍 検索"}
        </button>
      </div>
    </form>
  );
}
