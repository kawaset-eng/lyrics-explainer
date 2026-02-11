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
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="曲名 (例: Bohemian Rhapsody)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        />
        <input
          type="text"
          placeholder="アーティスト名 (例: Queen)"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
        />
        <button
          type="submit"
          disabled={isLoading || !title.trim() || !artist.trim()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isLoading ? "検索中..." : "検索"}
        </button>
      </div>
    </form>
  );
}
