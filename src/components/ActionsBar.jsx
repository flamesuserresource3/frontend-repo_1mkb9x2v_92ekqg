import { RotateCcw, Sparkles } from "lucide-react";

export default function ActionsBar({ onClear, onQuickFix, disabled }) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="text-sm text-gray-500">Tip: The quick-fix applies non-destructive formatting and safe rewrites.</div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" /> Clear
        </button>
        <button
          onClick={onQuickFix}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-sm font-medium shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" /> Quick Fix
        </button>
      </div>
    </div>
  );
}
