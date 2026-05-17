"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownEditor } from "@/components/documents/MarkdownEditor";
import { MarkdownPreview } from "@/components/documents/MarkdownPreview";
import { cn } from "@/lib/utils";

export type DocumentKey = "brd" | "prd" | "srs" | "agent";

export type DocumentState = {
  brd: string;
  prd: string;
  srs: string;
  agent: string;
};

type DocumentTabsProps = {
  initialDocuments?: Partial<DocumentState>;
  onDocumentsChange?: (documents: DocumentState) => void;
};

const tabItems: Array<{ key: DocumentKey; label: string }> = [
  { key: "brd", label: "BRD" },
  { key: "prd", label: "PRD" },
  { key: "srs", label: "SRS" },
  { key: "agent", label: "AGENT" },
];

function normalizeDocuments(initial?: Partial<DocumentState>): DocumentState {
  return {
    brd: initial?.brd ?? "",
    prd: initial?.prd ?? "",
    srs: initial?.srs ?? "",
    agent: initial?.agent ?? "",
  };
}

export function DocumentTabs({ initialDocuments, onDocumentsChange }: DocumentTabsProps) {
  const [activeTab, setActiveTab] = useState<DocumentKey>("brd");
  const [documents, setDocuments] = useState<DocumentState>(() =>
    normalizeDocuments(initialDocuments),
  );

  useEffect(() => {
    onDocumentsChange?.(documents);
  }, [documents, onDocumentsChange]);

  const currentLabel = useMemo(
    () => tabItems.find((item) => item.key === activeTab)?.label ?? "Document",
    [activeTab],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/80 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabItems.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <Button
                  key={tab.key}
                  type="button"
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  className={cn(
                    "min-w-20",
                    !isActive && "bg-background/70 hover:bg-accent",
                  )}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>

          <Badge variant="secondary">
            Active: {currentLabel}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <MarkdownEditor
          title={currentLabel}
          value={documents[activeTab]}
          onChange={(value) =>
            setDocuments((previousDocuments) => ({
              ...previousDocuments,
              [activeTab]: value,
            }))
          }
          placeholder={`Edit ${currentLabel} markdown di sini...`}
        />
        <MarkdownPreview title={currentLabel} markdown={documents[activeTab]} />
      </div>
    </div>
  );
}
