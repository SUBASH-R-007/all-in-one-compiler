import { useRef, useEffect } from "react";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: string;
}

export function CodeEditor({ code, onChange, language }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = code.split("\n");
  const lineCount = lines.length;

  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [code]);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent copy-paste operations
    if (e.ctrlKey && (
      e.key === 'c' || e.key === 'C' ||
      e.key === 'v' || e.key === 'V' ||
      e.key === 'x' || e.key === 'X' ||
      e.key === 'a' || e.key === 'A'
    )) {
      e.preventDefault();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode);
      
      // Set cursor position after the tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="editor-container flex h-full overflow-hidden">
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 w-12 bg-editor-line/50 border-r border-border overflow-hidden select-none"
      >
        <div className="py-4 px-2 text-right">
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i + 1}
              className="font-mono text-xs leading-relaxed text-muted-foreground/60"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Code Area */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onPaste={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          spellCheck={false}
          className="code-textarea w-full h-full p-4 text-foreground placeholder:text-muted-foreground/50 scrollbar-thin no-select"
          placeholder={`// Start coding in ${language}...`}
          autoComplete="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
        />
      </div>
    </div>
  );
}
