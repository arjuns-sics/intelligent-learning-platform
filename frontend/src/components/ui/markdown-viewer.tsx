/**
 * Markdown Viewer
 * Renders markdown content with proper styling
 */

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Simple markdown to HTML conversion
    let html = content
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-5 mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mt-4 mb-2">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-medium mt-3 mb-2">$1</h4>')
      
      // Bold
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      
      // Strikethrough
      .replace(/~~(.*)~~/gim, '<del>$1</del>')
      
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono">$2</code></pre>')
      
      // Inline code
      .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 text-muted-foreground bg-muted/50">$1</blockquote>')
      
      // Unordered lists
      .replace(/^\s*[-*+]\s+(.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      
      // Horizontal rule
      .replace(/^---$/gim, '<hr class="my-6 border-border" />')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
      
      // Line breaks
      .replace(/\n$/gim, '<br />');

    // Wrap consecutive list items in ul/ol
    html = html.replace(/(<li class="list-disc">.*?<\/li>)+/gims, '<ul class="my-4 space-y-1">$&</ul>');
    html = html.replace(/(<li class="list-decimal">.*?<\/li>)+/gims, '<ol class="my-4 space-y-1">$&</ol>');

    return html;
  }, [content]);

  if (!content) {
    return (
      <div className="text-muted-foreground text-sm">
        No content available
      </div>
    );
  }

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
        "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-4",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:my-4 prose-blockquote:text-muted-foreground prose-blockquote:bg-muted/50",
        "prose-ul:my-4 prose-ul:space-y-1",
        "prose-ol:my-4 prose-ol:space-y-1",
        "prose-li:ml-4",
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
