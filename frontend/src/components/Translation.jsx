export default function Translation({ translation }) {
  if (!translation) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">&#127471;&#127477;</span> 日本語訳
      </h2>
      <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
        {translation}
      </pre>
    </div>
  );
}
