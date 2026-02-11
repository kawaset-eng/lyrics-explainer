export default function Logo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* レコード盤のアイコン */}
      <div className="relative w-12 h-12 logo-record">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300"
        >
          {/* 外側の円（レコード盤） */}
          <circle cx="24" cy="24" r="22" fill="url(#gradient1)" />

          {/* レコードの溝（複数の円） */}
          <circle cx="24" cy="24" r="18" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3" />
          <circle cx="24" cy="24" r="16" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3" />
          <circle cx="24" cy="24" r="14" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3" />
          <circle cx="24" cy="24" r="12" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3" />
          <circle cx="24" cy="24" r="10" stroke="#4c1d95" strokeWidth="0.5" opacity="0.3" />

          {/* レーベル部分（中央の円） */}
          <circle cx="24" cy="24" r="8" fill="url(#gradient2)" />

          {/* 中心の穴 */}
          <circle cx="24" cy="24" r="3" fill="#1e1b4b" />

          {/* 音符マーク */}
          <path
            d="M26 20 L26 16 L30 15 L30 19"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="26" cy="21" r="1.5" fill="white" />
          <circle cx="30" cy="20" r="1.5" fill="white" />

          {/* グラデーション定義 */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

      </div>

      {/* テキストロゴ */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Lyrics Explainer
        </h1>
        <p className="text-xs text-gray-500 -mt-1">洋楽歌詞を深く理解する</p>
      </div>
    </div>
  );
}
