import { ClipboardCopy, CheckCircle2, AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function ReviewResults({ language, issues, fixedCode }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(fixedCode || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Detected language</p>
          <p className="text-base font-semibold">{language || "Unknown"}</p>
        </div>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Copied
            </>
          ) : (
            <>
              <ClipboardCopy className="h-4 w-4" /> Copy fixed code
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium">Issues & Suggestions</div>
          <ul className="max-h-[360px] overflow-auto divide-y divide-gray-100">
            {issues.length === 0 ? (
              <li className="p-4 text-sm text-gray-500">No obvious issues detected. Your code looks good!</li>
            ) : (
              issues.map((it, idx) => (
                <li key={idx} className="p-4 text-sm flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                  <span>
                    <span className="font-medium">{it.rule}:</span> {it.message}
                    {it.location ? (
                      <span className="text-gray-500"> (line {it.location.line})</span>
                    ) : null}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium">Fixed Code (preview)</div>
          <pre className="max-h-[360px] overflow-auto p-4 bg-white text-xs md:text-sm leading-6 font-mono whitespace-pre-wrap">{fixedCode}</pre>
        </div>
      </div>
    </div>
  );
}
