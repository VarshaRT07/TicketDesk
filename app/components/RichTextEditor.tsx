import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Redo,
  Underline,
  Undo,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState, type JSX } from "react";
import { Button } from "./ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: RichTextEditorProps): JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const [active, setActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    ul: false,
    ol: false,
    quote: false,
  });
  const editorRef = useRef<HTMLDivElement | null>(null);
  const isUpdatingRef = useRef(false);
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);

  const syncFromDom = () => {
    if (!editorRef.current || isUpdatingRef.current) return;

    const html = editorRef.current.innerHTML;
    if (html !== value) {
      // Add to undo stack
      if (value && value !== html) {
        undoStack.current.push(value);
        // Limit undo stack size
        if (undoStack.current.length > 50) {
          undoStack.current.shift();
        }
        // Clear redo stack when new content is added
        redoStack.current = [];
      }
      onChange(html);
    }
  };

  const handleCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    document.execCommand(command, false, commandValue);
    syncFromDom();
    updateActiveStates();
  };

  const handleUndo = () => {
    if (undoStack.current.length === 0) return;

    const previousValue = undoStack.current.pop()!;
    redoStack.current.push(value);

    isUpdatingRef.current = true;
    if (editorRef.current) {
      editorRef.current.innerHTML = previousValue;
    }
    onChange(previousValue);

    setTimeout(() => {
      isUpdatingRef.current = false;
      updateActiveStates();
    }, 0);
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) return;

    const nextValue = redoStack.current.pop()!;
    undoStack.current.push(value);

    isUpdatingRef.current = true;
    if (editorRef.current) {
      editorRef.current.innerHTML = nextValue;
    }
    onChange(nextValue);

    setTimeout(() => {
      isUpdatingRef.current = false;
      updateActiveStates();
    }, 0);
  };

  const handleContentChange = () => {
    if (isUpdatingRef.current) return;
    syncFromDom();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    syncFromDom();
  };

  const updateActiveStates = () => {
    if (!editorRef.current || !isFocused) return;

    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      quote: document.queryCommandValue("formatBlock") === "blockquote",
    });
  };

  // Update editor content when value prop changes (but not during internal updates)
  useEffect(() => {
    if (isUpdatingRef.current) return;

    if (editorRef.current && value !== editorRef.current.innerHTML) {
      isUpdatingRef.current = true;
      editorRef.current.innerHTML = value;

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [value]);

  useEffect(() => {
    const updateStates = () => {
      if (isFocused) {
        updateActiveStates();
      }
    };

    document.addEventListener("selectionchange", updateStates);
    return () => document.removeEventListener("selectionchange", updateStates);
  }, [isFocused]);

  return (
    <div
      className={`relative rounded-md border border-border bg-card ${className || ""}`}
    >
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex items-center gap-1 border-b border-border bg-muted/30 p-2"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand("bold")}
          aria-pressed={active.bold}
          title="Bold"
          className={`h-8 w-8 p-0 ${active.bold ? "bg-secondary" : ""}`}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand("italic")}
          aria-pressed={active.italic}
          title="Italic"
          className={`h-8 w-8 p-0 ${active.italic ? "bg-secondary" : ""}`}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand("underline")}
          aria-pressed={active.underline}
          title="Underline"
          className={`h-8 w-8 p-0 ${active.underline ? "bg-secondary" : ""}`}
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand("insertUnorderedList")}
          aria-pressed={active.ul}
          title="Bullet List"
          className={`h-8 w-8 p-0 ${active.ul ? "bg-secondary" : ""}`}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand("insertOrderedList")}
          aria-pressed={active.ol}
          title="Numbered List"
          className={`h-8 w-8 p-0 ${active.ol ? "bg-secondary" : ""}`}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleCommand("formatBlock", "blockquote")}
          aria-pressed={active.quote}
          title="Quote"
          className={`h-8 w-8 p-0 ${active.quote ? "bg-secondary" : ""}`}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) handleCommand("createLink", url);
          }}
          title="Add Link"
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={undoStack.current.length === 0}
          title="Undo"
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={redoStack.current.length === 0}
          title="Redo"
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Description"
        onInput={handleContentChange}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[120px] rounded-b-md p-3 outline-none focus:ring-2 focus:ring-ring ${
          !value && !isFocused ? "text-muted-foreground" : "text-foreground"
        }`}
        style={{
          wordBreak: "break-word",
        }}
        suppressContentEditableWarning={true}
      />

      {/* Placeholder */}
      {!value && !isFocused && placeholder && (
        <div className="absolute top-[60px] left-3 right-3 pointer-events-none text-muted-foreground text-sm">
          {placeholder}
        </div>
      )}
    </div>
  );
}
