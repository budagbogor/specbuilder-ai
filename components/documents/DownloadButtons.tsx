"use client";

import { useMemo, useState } from "react";
import { Archive, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadDocumentFromState,
  type ExportDocumentKey,
  type ExportableDocuments,
} from "@/lib/export/downloadMarkdown";
import { exportZip } from "@/lib/export/exportZip";

type DownloadButtonsProps = {
  documents: ExportableDocuments;
};

const perFileButtons: Array<{ key: ExportDocumentKey; label: string }> = [
  { key: "brd", label: "Download brd.md" },
  { key: "prd", label: "Download prd.md" },
  { key: "srs", label: "Download srs.md" },
  { key: "agent", label: "Download agent.md" },
];

export function DownloadButtons({ documents }: DownloadButtonsProps) {
  const [isExportingZip, setIsExportingZip] = useState(false);

  const hasAnyContent = useMemo(
    () =>
      Object.values(documents).some(
        (content) => typeof content === "string" && content.trim().length > 0,
      ),
    [documents],
  );

  const handleDownloadFile = (key: ExportDocumentKey) => {
    downloadDocumentFromState(documents, key);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExportingZip(true);
      await exportZip(documents, "specbuilder-docs.zip");
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide uppercase">
          Export Documents
        </h3>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {perFileButtons.map((buttonItem) => (
          <Button
            key={buttonItem.key}
            type="button"
            variant="outline"
            onClick={() => handleDownloadFile(buttonItem.key)}
          >
            <Download className="mr-2 h-4 w-4" />
            {buttonItem.label}
          </Button>
        ))}

        <Button
          type="button"
          onClick={handleDownloadZip}
          disabled={isExportingZip || !hasAnyContent}
          className="sm:col-span-2 xl:col-span-1"
        >
          <Archive className="mr-2 h-4 w-4" />
          {isExportingZip ? "Preparing zip..." : "Download specbuilder-docs.zip"}
        </Button>
      </div>
    </div>
  );
}
