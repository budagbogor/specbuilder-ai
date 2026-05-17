import "server-only";
import OpenAI from "openai";

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.2";

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
