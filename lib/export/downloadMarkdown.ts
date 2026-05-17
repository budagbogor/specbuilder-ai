export type ExportDocumentKey = "brd" | "prd" | "srs" | "agent";

export type ExportableDocuments = Record<ExportDocumentKey, string>;

export const MARKDOWN_FILE_NAME_BY_KEY: Record<ExportDocumentKey, string> = {
  brd: "brd.md",
  prd: "prd.md",
  srs: "srs.md",
  agent: "agent.md",
};

function normalizeMarkdownContent(content: string): string {
  return content.replaceAll("\r\n", "\n");
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename.toLowerCase();
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function downloadMarkdownFile(key: ExportDocumentKey, content: string) {
  const safeContent = normalizeMarkdownContent(content ?? "");
  const blob = new Blob([safeContent], { type: "text/markdown;charset=utf-8" });
  triggerBlobDownload(blob, MARKDOWN_FILE_NAME_BY_KEY[key]);
}

export function downloadDocumentFromState(
  documents: ExportableDocuments,
  key: ExportDocumentKey,
) {
  downloadMarkdownFile(key, documents[key]);
}

export function downloadBlobFile(blob: Blob, filename: string) {
  triggerBlobDownload(blob, filename);
}
