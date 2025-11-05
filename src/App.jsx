import { useMemo, useState } from "react";
import Header from "./components/Header";
import CodeInput from "./components/CodeInput";
import ReviewResults from "./components/ReviewResults";
import ActionsBar from "./components/ActionsBar";

// Simple language detection using heuristics
function detectLanguage(code) {
  const sample = code.slice(0, 2000);
  const tests = [
    { lang: "TypeScript", test: /:\s*(string|number|boolean|any|unknown|never|\w+\[\])/ },
    { lang: "JavaScript", test: /(const|let|var)\s+\w+\s*=|function\s*\(|=>|import\s+.*from\s+['"]/ },
    { lang: "Python", test: /def\s+\w+\(|class\s+\w+:|print\(|^\s*import\s+\w+/m },
    { lang: "C++", test: /#include\s*<.*>|std::|using\s+namespace\s+std/ },
    { lang: "C", test: /#include\s*<.*>|printf\s*\(/ },
    { lang: "Java", test: /public\s+class\s+|System\.out\.println|public\s+static\s+void\s+main/ },
    { lang: "Go", test: /package\s+main|fmt\./ },
    { lang: "Rust", test: /fn\s+main\(\)|let\s+mut\s+|println!/ },
    { lang: "PHP", test: /<\?php|\$\w+\s*=|echo\s+/ },
    { lang: "HTML", test: /<(!DOCTYPE|html|head|body|div|span|script|style|img|a)[\s>]/i },
    { lang: "CSS", test: /\.[a-zA-Z0-9_-]+\s*\{|#[a-fA-F0-9]{3,6}\b|:\s*(flex|grid|block|inline)/ },
    { lang: "Shell", test: /^#!/ },
  ];
  for (const t of tests) if (t.test.test(sample)) return t.lang;
  return "Unknown";
}

function analyzeCode(code) {
  const language = detectLanguage(code);
  const issues = [];
  const lines = code.split(/\r?\n/);

  const push = (rule, message, lineIdx) => issues.push({ rule, message, location: lineIdx != null ? { line: lineIdx + 1 } : undefined });

  // Generic checks
  lines.forEach((ln, i) => {
    if (/\s+$/.test(ln)) push("TrailingWhitespace", "Remove trailing spaces.", i);
    if (/\t/.test(ln)) push("Tabs", "Replace tabs with spaces for consistency.", i);
  });
  if (!code.endsWith("\n")) push("FinalNewline", "Add a newline at end of file.");

  if (language === "JavaScript" || language === "TypeScript") {
    lines.forEach((ln, i) => {
      const trimmed = ln.trim();
      if (
        trimmed &&
        !/[;{[,:]$/.test(trimmed) &&
        /[\w)"'\]\}]$/.test(trimmed) &&
        !/^\s*(if|for|while|else|switch|try|catch|finally)\b/.test(trimmed)
      ) {
        push("Semicolons", "Consider adding semicolons for consistency.", i);
      }
      if (/==[^=]/.test(ln)) push("Equality", "Use strict equality (===/!==).", i);
      if (/console\.log\(/.test(ln)) push("ConsoleLog", "Remove debug console.log statements.", i);
      if (/var\s+/.test(ln)) push("Var", "Prefer const/let over var.", i);
    });
  }

  if (language === "Python") {
    lines.forEach((ln, i) => {
      if (/==\s*None/.test(ln)) push("NoneCompare", "Use 'is None' instead of '== None'.", i);
      if (/!=\s*None/.test(ln)) push("NoneCompare", "Use 'is not None' instead of '!= None'.", i);
      if (/print\s+[^\(]/.test(ln)) push("PrintPy2", "Use print() function syntax.", i);
    });
    // Indentation consistency
    const indents = lines.filter(l=>l.trim().length).map(l=>l.match(/^\s*/)[0]);
    const mixed = indents.some(sp => sp.includes("\t")) && indents.some(sp => sp.includes(" "));
    if (mixed) push("Indentation", "Avoid mixing tabs and spaces for indentation.");
  }

  if (language === "C++") {
    lines.forEach((ln, i) => {
      if (/using\s+namespace\s+std\s*;/.test(ln)) push("Namespace", "Avoid 'using namespace std;' in headers and large scopes.", i);
    });
  }

  if (language === "HTML") {
    lines.forEach((ln, i) => {
      if (/ <img\b(?![^>]*\balt=)/i.test(" " + ln)) push("ImgAlt", "Add alt attribute to images for accessibility.", i);
    });
    if (!/<html\b[^>]*lang=/i.test(code) && /<html\b/i.test(code)) push("LangAttr", "Add lang attribute to <html> tag.");
  }

  if (language === "CSS") {
    lines.forEach((ln, i) => {
      if (/!important/.test(ln)) push("Important", "Avoid overusing !important.", i);
    });
  }

  return { language, issues };
}

function applyQuickFix(code, language) {
  let out = code;
  // Generic: trim trailing whitespace and ensure final newline
  out = out
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/g, "").replace(/\t/g, "    "))
    .join("\n");
  if (!out.endsWith("\n")) out += "\n";

  if (language === "JavaScript" || language === "TypeScript") {
    const lines = out.split(/\r?\n/).map((ln) => {
      const t = ln.trim();
      if (
        t &&
        !/[;{[,:]$/.test(t) &&
        /[\w)"'\]\}]$/.test(t) &&
        !/^\s*(if|for|while|else|switch|try|catch|finally)\b/.test(t)
      ) {
        return ln + ";";
      }
      // == to === when safe-ish
      let fixed = ln.replace(/([^=!])==([^=])/g, "$1===$2").replace(/!=([^=])/g, "!==$1");
      // var -> let (conservative)
      fixed = fixed.replace(/\bvar\b/g, "let");
      return fixed;
    });
    out = lines.join("\n");
  }

  if (language === "Python") {
    out = out
      .replace(/==\s*None/g, "is None")
      .replace(/!=\s*None/g, "is not None");
  }

  if (language === "HTML") {
    // Add alt="" to <img> without alt
    out = out.replace(/<img([^>]*)(?<!alt=\"[^\"]*\")\s*\/>/gi, (m, attrs) => `<img${attrs} alt="" />`);
  }

  return out;
}

export default function App() {
  const [code, setCode] = useState("");
  const { language, issues } = useMemo(() => analyzeCode(code), [code]);
  const fixedCode = useMemo(() => applyQuickFix(code, language), [code, language]);

  const clear = () => setCode("");

  const sample = `// Try me (JavaScript)
function greet(name){
  if(name == null){
    console.log('Hello, stranger')
    return 'Hi ' + name
  }
  var msg = 'Hello, ' + name
  return msg
}
`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        <Header />

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <CodeInput code={code} setCode={setCode} onReview={() => setCode(code || sample)} />
            <ActionsBar onClear={clear} onQuickFix={() => setCode(fixedCode)} disabled={!code} />
          </div>
          <div>
            <ReviewResults language={language} issues={issues} fixedCode={fixedCode} />
          </div>
        </div>

        <div className="py-8 text-center text-sm text-gray-500">
          Works best with JavaScript/TypeScript, Python, HTML/CSS, C/C++, and more. No code leaves your browser.
        </div>
      </div>
    </div>
  );
}
