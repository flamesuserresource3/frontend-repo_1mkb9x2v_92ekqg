import { useEffect, useRef } from "react";

export default function CodeInput({ code, setCode, onReview }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [code]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Paste your code</label>
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Paste code in any language (JS, TS, Python, C/C++, Java, HTML/CSS, Go, Rust, etc.)`}
        className="w-full min-h-[200px] max-h-[420px] rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-4 font-mono text-sm leading-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
      />
      <div className="flex justify-end mt-3">
        <button
          onClick={onReview}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium shadow hover:bg-indigo-700 active:bg-indigo-800 transition"
        >
          Review Code
        </button>
      </div>
    </div>
  );
}
