const CONTROL_CHAR_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizePromptText(value: string): string {
  return value.replace(CONTROL_CHAR_REGEX, " ").replace(/\r\n/g, "\n").trim();
}

export function sanitizePromptInput<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizePromptText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePromptInput(item)) as T;
  }

  if (value && typeof value === "object") {
    const sanitizedEntries = Object.entries(value).map(([key, nestedValue]) => [
      key,
      sanitizePromptInput(nestedValue),
    ]);

    return Object.fromEntries(sanitizedEntries) as T;
  }

  return value;
}
