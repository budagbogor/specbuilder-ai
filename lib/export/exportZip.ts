import JSZip from "jszip";
import {
  MARKDOWN_FILE_NAME_BY_KEY,
  downloadBlobFile,
  type ExportableDocuments,
  type ExportDocumentKey,
} from "@/lib/export/downloadMarkdown";

const DEFAULT_ZIP_FILENAME = "specbuilder-docs.zip";

export async function exportZip(
  documents: ExportableDocuments,
  zipFilename: string = DEFAULT_ZIP_FILENAME,
) {
  const zip = new JSZip();

  const documentKeys = Object.keys(MARKDOWN_FILE_NAME_BY_KEY) as ExportDocumentKey[];
  for (const key of documentKeys) {
    const fileName = MARKDOWN_FILE_NAME_BY_KEY[key].toLowerCase();
    const fileContent = (documents[key] ?? "").replaceAll("\r\n", "\n");
    zip.file(fileName, fileContent);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlobFile(zipBlob, zipFilename.toLowerCase());
}
