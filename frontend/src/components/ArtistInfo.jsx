export default function ArtistInfo({ artistInfo, background, artist }) {
  const paragraphs = (text) => (text || "").split("\n\n").filter(Boolean);

  return (
    <>
      {background && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">&#128214;</span> 曲の背景
          </h2>
          <div className="space-y-3">
            {paragraphs(background).map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed text-sm">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}

      {artistInfo && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">&#127908;</span> {artist} について
          </h2>
          <div className="space-y-3">
            {paragraphs(artistInfo).map((p, i) => (
              <p key={i} className="text-gray-700 leading-relaxed text-sm">
                {p}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
