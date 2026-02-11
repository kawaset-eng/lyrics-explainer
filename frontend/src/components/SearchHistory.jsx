export default function SearchHistory({
  history,
  onSelectHistory,
  onRemoveHistory,
  onClearHistory,
  isVisible,
}) {
  if (!isVisible || history.length === 0) {
    return null;
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'たった今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}時間前`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}日前`;

    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          検索履歴
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
            title="すべて削除"
          >
            すべて削除
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
            onClick={() => onSelectHistory(item.title, item.artist)}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {item.artist} · {formatDate(item.timestamp)}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveHistory(item.id);
              }}
              className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all p-1"
              title="削除"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
