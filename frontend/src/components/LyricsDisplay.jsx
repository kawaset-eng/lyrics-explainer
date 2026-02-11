export default function LyricsDisplay({ lyrics, geniusUrl }) {
  if (!lyrics) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-6 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="text-2xl">♪</span> Lyrics
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
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-purple-600 transition-colors font-medium"
          >
            Genius で歌詞を確認
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
