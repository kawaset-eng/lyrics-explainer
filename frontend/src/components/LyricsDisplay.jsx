export default function LyricsDisplay({ lyrics, geniusUrl }) {
  if (!lyrics) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">&#9835;</span> Lyrics
      </h2>
      <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
        {lyrics}
      </pre>
      {geniusUrl && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <a
            href={geniusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
          >
            Genius で歌詞を確認 &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
