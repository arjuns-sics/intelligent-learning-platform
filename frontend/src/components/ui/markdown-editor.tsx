/**
 * Markdown Editor
 * A simple markdown editor with live preview
 */

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconLink,
  IconCode,
  IconQuote,
  IconHeading,
  IconEye,
  IconPencil,
} from "@tabler/icons-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in markdown...",
  className = "",
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertText = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      );
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: IconHeading,
      title: "Heading",
      onClick: () => insertText("### ", ""),
    },
    {
      icon: IconBold,
      title: "Bold",
      onClick: () => insertText("**", "**"),
    },
    {
      icon: IconItalic,
      title: "Italic",
      onClick: () => insertText("*", "*"),
    },
    {
      icon: IconQuote,
      title: "Quote",
      onClick: () => insertText("> ", ""),
    },
    {
      icon: IconList,
      title: "Bullet List",
      onClick: () => insertText("- ", ""),
    },
    {
      icon: IconListNumbers,
      title: "Numbered List",
      onClick: () => insertText("1. ", ""),
    },
    {
      icon: IconLink,
      title: "Link",
      onClick: () => insertText("[", "](url)"),
    },
    {
      icon: IconCode,
      title: "Code",
      onClick: () => insertText("`", "`"),
    },
  ];

  const renderPreview = (markdown: string) => {
    // Simple markdown rendering
    let html = markdown
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(/^### (.*$)/gim, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2 class='text-xl font-semibold mt-5 mb-3'>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1 class='text-2xl font-semibold mt-6 mb-4'>$1</h1>")
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      // Code
      .replace(/`(.*?)`/gim, "<code class='bg-muted px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>")
      // Blockquote
      .replace(/^> (.*$)/gim, "<blockquote class='border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/50 rounded-r'>$1</blockquote>")
      // Bullet lists
      .replace(/^- (.*$)/gim, "<li class='ml-4 list-disc'>$1</li>")
      // Numbered lists
      .replace(/^\d+\. (.*$)/gim, "<li class='ml-4 list-decimal'>$1</li>")
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2' class='text-primary hover:underline' target='_blank' rel='noopener noreferrer'>$1</a>")
      // Line breaks
      .replace(/\n$/gim, "<br />");

    return html;
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 border-b bg-muted/30">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={button.onClick}
              title={button.title}
            >
              <button.icon className="size-4" />
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <IconPencil className="size-4" />
              <span className="text-xs">Edit</span>
            </>
          ) : (
            <>
              <IconEye className="size-4" />
              <span className="text-xs">Preview</span>
            </>
          )}
        </Button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className="p-4 min-h-[200px] max-h-[400px] overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] max-h-[400px] font-mono text-sm resize-y border-0 rounded-t-none"
        />
      )}
    </div>
  );
}
