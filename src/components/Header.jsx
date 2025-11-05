import { Code2, Wand2 } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full flex items-center justify-between gap-4 py-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md">
          <Code2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Universal Code Reviewer</h1>
          <p className="text-sm text-gray-500">Review and auto-fix code across popular languages</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
        <Wand2 className="h-4 w-4" />
        <span className="text-sm font-medium">AI-style heuristics (local)</span>
      </div>
    </header>
  );
}
