"use client";

import { useMemo } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type MarkdownPreviewProps = {
  markdown: string;
  title: string;
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return "#";
  }

  try {
    const parsed = new URL(trimmed, "https://example.com");
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    return "#";
  }

  return "#";
}

function renderInline(text: string): string {
  let output = escapeHtml(text);

  output = output.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, url: string) =>
      `<a href="${sanitizeUrl(url)}" target="_blank" rel="noreferrer" class="text-primary underline decoration-primary/50 underline-offset-4">${label}</a>`,
  );
  output = output.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-muted/70 px-1 py-0.5 font-mono text-[0.92em]">$1</code>',
  );
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return output;
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const htmlBlocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      htmlBlocks.push(
        `<pre class="overflow-x-auto rounded-xl border border-border/70 bg-muted/30 p-3"><code class="font-mono text-xs sm:text-sm">${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = renderInline(headingMatch[2]);
      const headingClasses: Record<number, string> = {
        1: "mt-1 text-3xl font-semibold tracking-tight",
        2: "mt-6 text-2xl font-semibold",
        3: "mt-5 text-xl font-semibold",
        4: "mt-4 text-lg font-semibold",
        5: "mt-3 text-base font-semibold",
        6: "mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground",
      };
      htmlBlocks.push(
        `<h${level} class="${headingClasses[level] ?? headingClasses[4]}">${content}</h${level}>`,
      );
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        const item = lines[index].trim().replace(/^[-*]\s+/, "");
        listItems.push(`<li>${renderInline(item)}</li>`);
        index += 1;
      }
      htmlBlocks.push(
        `<ul class="my-3 list-disc space-y-1 pl-5 text-sm sm:text-base">${listItems.join("")}</ul>`,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        const item = lines[index].trim().replace(/^\d+\.\s+/, "");
        listItems.push(`<li>${renderInline(item)}</li>`);
        index += 1;
      }
      htmlBlocks.push(
        `<ol class="my-3 list-decimal space-y-1 pl-5 text-sm sm:text-base">${listItems.join("")}</ol>`,
      );
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s+/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s+/, ""));
        index += 1;
      }
      htmlBlocks.push(
        `<blockquote class="my-4 border-l-4 border-primary/40 bg-muted/30 px-4 py-2 text-sm italic sm:text-base">${renderInline(quoteLines.join(" "))}</blockquote>`,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const currentLine = lines[index];
      const currentTrimmed = currentLine.trim();

      if (
        !currentTrimmed ||
        currentTrimmed.startsWith("```") ||
        /^(#{1,6})\s+/.test(currentTrimmed) ||
        /^[-*]\s+/.test(currentTrimmed) ||
        /^\d+\.\s+/.test(currentTrimmed) ||
        /^>\s+/.test(currentTrimmed)
      ) {
        break;
      }

      paragraphLines.push(currentTrimmed);
      index += 1;
    }

    htmlBlocks.push(
      `<p class="my-3 text-sm leading-7 sm:text-base">${renderInline(paragraphLines.join(" "))}</p>`,
    );
  }

  return htmlBlocks.join("");
}

export function MarkdownPreview({ markdown, title }: MarkdownPreviewProps) {
  const html = useMemo(() => markdownToHtml(markdown), [markdown]);

  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground">
          <Eye className="h-4 w-4 text-primary" />
          {title} Preview
        </h3>
        <Badge variant="outline">Markdown</Badge>
      </header>

      {markdown.trim().length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-background/60 p-5 text-sm text-muted-foreground">
          Belum ada konten markdown untuk dipreview.
        </div>
      ) : (
        <article
          className="max-h-[520px] overflow-auto rounded-xl border border-border/70 bg-background/75 p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </section>
  );
}
