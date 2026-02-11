export default function Interpretation({ interpretation }) {
  if (!interpretation) return null;

  const paragraphs = interpretation.split("\n\n");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">&#128270;</span> 歌詞の解釈・意味
      </h2>
      <div className="space-y-3">
        {paragraphs.map((paragraph, i) => (
          <p key={i} className="text-gray-700 leading-relaxed text-sm">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
