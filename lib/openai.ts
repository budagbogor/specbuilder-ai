import "server-only";
import OpenAI from "openai";

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL?.trim() || "gpt-5.2";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
}

function parseNonNegativeInt(value: string | undefined, fallback: number): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return parsedValue;
}

const DEFAULT_TIMEOUT_MS = parsePositiveInt(process.env.OPENAI_TIMEOUT_MS, 45_000);
const DEFAULT_MAX_RETRIES = parseNonNegativeInt(
  process.env.OPENAI_MAX_RETRIES,
  2,
);

const globalForOpenAI = globalThis as unknown as {
  openaiClient?: OpenAI;
};

function getOpenAIApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add OPENAI_API_KEY to your environment variables.",
    );
  }

  return apiKey;
}

export function getOpenAIClient() {
  if (!globalForOpenAI.openaiClient) {
    globalForOpenAI.openaiClient = new OpenAI({
      apiKey: getOpenAIApiKey(),
      timeout: DEFAULT_TIMEOUT_MS,
      maxRetries: DEFAULT_MAX_RETRIES,
    });
  }

  return globalForOpenAI.openaiClient;
}

export type CallOpenAIModelParams = {
  input: string;
  instructions?: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
};

export type CallOpenAIModelResult = {
  text: string;
  requestId: string | null;
};

export async function callOpenAIModel(
  params: CallOpenAIModelParams,
): Promise<CallOpenAIModelResult> {
  if (!params.input || params.input.trim().length === 0) {
    throw new Error("Model input cannot be empty.");
  }

  const client = getOpenAIClient();

  try {
    const response = await client.responses.create({
      model: params.model ?? DEFAULT_OPENAI_MODEL,
      input: params.input,
      instructions: params.instructions,
      temperature: params.temperature,
      max_output_tokens: params.maxOutputTokens,
    }, {
      timeout: params.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      maxRetries: params.maxRetries ?? DEFAULT_MAX_RETRIES,
    });

    return {
      text: response.output_text ?? "",
      requestId: response._request_id ?? null,
    };
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(
        `OpenAI request failed (${error.status ?? "unknown"}): ${error.message}`,
      );
    }

    if (error instanceof Error) {
      throw new Error(`Failed to call OpenAI model: ${error.message}`);
    }

    throw new Error("Failed to call OpenAI model due to an unknown error.");
  }
}
