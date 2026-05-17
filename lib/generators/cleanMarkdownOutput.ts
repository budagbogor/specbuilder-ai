function normalizeLineEndings(input: string): string {
  return input.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function unwrapSingleMarkdownFence(input: string): string {
  const fencedMatch = input.trim().match(/^```(?:markdown|md)?\s*([\s\S]*?)\s*```$/i);
  if (!fencedMatch?.[1]) {
    return input;
  }

  return fencedMatch[1].trim();
}

function tryExtractMarkdownFromJsonPayload(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return readMarkdownCandidate(parsed);
  } catch {
    return null;
  }
}

function readMarkdownCandidate(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const recordValue = value as Record<string, unknown>;
  const preferredKeys = [
    "markdown",
    "content",
    "text",
    "document",
    "brd",
    "prd",
    "srs",
    "agent",
  ];

  for (const key of preferredKeys) {
    const candidateValue = recordValue[key];
    if (typeof candidateValue !== "string") {
      continue;
    }

    const normalizedCandidate = candidateValue.trim();
    if (normalizedCandidate.length > 0) {
      return normalizedCandidate;
    }
  }

  for (const candidateValue of Object.values(recordValue)) {
    if (typeof candidateValue !== "string") {
      continue;
    }

    const normalizedCandidate = candidateValue.trim();
    if (normalizedCandidate.length === 0) {
      continue;
    }

    if (normalizedCandidate.includes("#")) {
      return normalizedCandidate;
    }
  }

  return null;
}

function stripContextMarkerLines(input: string): string {
  return input
    .replace(/^CONTEXT_[A-Z0-9_]+:\s*$/gm, "")
    .replace(/^INTAKE_JSON:\s*$/gm, "")
    .replace(/^CLARIFICATION_JSON:\s*$/gm, "")
    .replace(/^BRD_JSON:\s*$/gm, "")
    .replace(/^PRD_JSON:\s*$/gm, "")
    .replace(/^SRS_JSON:\s*$/gm, "");
}

function replaceJsonFencedBlocks(input: string): string {
  return input.replace(/```([\w-]*)\s*([\s\S]*?)```/g, (_match, language, content) => {
    const normalizedLanguage = String(language ?? "").toLowerCase();
    const normalizedContent = String(content ?? "").trim();

    const looksLikeJsonFence = normalizedLanguage === "json";
    const looksLikeJsonContent =
      (normalizedContent.startsWith("{") && normalizedContent.endsWith("}")) ||
      (normalizedContent.startsWith("[") && normalizedContent.endsWith("]"));

    if (!looksLikeJsonFence && !looksLikeJsonContent) {
      return `\`\`\`${language}\n${content}\`\`\``;
    }

    try {
      JSON.parse(normalizedContent);
      return "Not specified by user";
    } catch {
      if (looksLikeJsonFence) {
        return "Not specified by user";
      }

      return `\`\`\`${language}\n${content}\`\`\``;
    }
  });
}

function replaceStandaloneJsonParagraphs(input: string): string {
  const paragraphs = input.split(/\n{2,}/g);

  const cleanedParagraphs = paragraphs.map((paragraph) => {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) {
      return "";
    }

    const startsLikeJson =
      (trimmedParagraph.startsWith("{") && trimmedParagraph.endsWith("}")) ||
      (trimmedParagraph.startsWith("[") && trimmedParagraph.endsWith("]"));

    if (!startsLikeJson) {
      return paragraph;
    }

    try {
      JSON.parse(trimmedParagraph);
      return "Not specified by user";
    } catch {
      return paragraph;
    }
  });

  return cleanedParagraphs.join("\n\n");
}

function collapseSpacing(input: string): string {
  return input.replace(/\n{3,}/g, "\n\n").trim();
}

export function containsRawJsonMarkdown(input: string): boolean {
  if (/```json\s*[\s\S]*?```/i.test(input)) {
    return true;
  }

  const paragraphs = input.split(/\n{2,}/g);
  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) {
      continue;
    }

    const startsLikeJson =
      (trimmedParagraph.startsWith("{") && trimmedParagraph.endsWith("}")) ||
      (trimmedParagraph.startsWith("[") && trimmedParagraph.endsWith("]"));

    if (!startsLikeJson) {
      continue;
    }

    try {
      JSON.parse(trimmedParagraph);
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

export function cleanMarkdownOutput(rawText: string): string {
  const normalizedRaw = normalizeLineEndings(rawText).trim();
  if (!normalizedRaw) {
    return "";
  }

  const extractedFromJson = tryExtractMarkdownFromJsonPayload(normalizedRaw);
  const withSelectedPayload = extractedFromJson ?? normalizedRaw;
  const unwrappedMarkdown = unwrapSingleMarkdownFence(withSelectedPayload);
  const withoutContextMarkers = stripContextMarkerLines(unwrappedMarkdown);
  const withoutFencedJson = replaceJsonFencedBlocks(withoutContextMarkers);
  const withoutStandaloneJson = replaceStandaloneJsonParagraphs(withoutFencedJson);

  return collapseSpacing(withoutStandaloneJson);
}
