"use client";

import { FilePenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  title: string;
  placeholder?: string;
};

export function MarkdownEditor({
  value,
  onChange,
  title,
  placeholder,
}: MarkdownEditorProps) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-foreground">
          <FilePenLine className="h-4 w-4 text-primary" />
          {title} Editor
        </h3>
        <Badge variant="outline">{value.length} chars</Badge>
      </header>

      <Textarea
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="min-h-[420px] font-mono text-sm leading-relaxed"
        placeholder={placeholder ?? "Tulis atau edit markdown di sini..."}
      />
    </section>
  );
}
