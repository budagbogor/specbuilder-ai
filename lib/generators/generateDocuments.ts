import { callOpenAIModel } from "@/lib/openai";
import {
  cleanMarkdownOutput,
  containsRawJsonMarkdown,
} from "@/lib/generators/cleanMarkdownOutput";
import {
  AGENT_SYSTEM_PROMPT,
  buildAgentPrompt,
} from "@/lib/prompts/agentPrompt";
import { BRD_SYSTEM_PROMPT, buildBrdPrompt } from "@/lib/prompts/brdPrompt";
import { PRD_SYSTEM_PROMPT, buildPrdPrompt } from "@/lib/prompts/prdPrompt";
import { SRS_SYSTEM_PROMPT, buildSrsPrompt } from "@/lib/prompts/srsPrompt";

type DocumentStep = "brd" | "prd" | "srs" | "agent";

export type GenerateDocumentsInput = {
  intake: Record<string, unknown>;
  clarificationQuestions?: unknown;
  clarificationAnswers?: unknown;
  model?: string;
};

export type GeneratedDocuments = {
  brd: string;
  prd: string;
  srs: string;
  agent: string;
};

export type GenerateDocumentsSafeResult =
  | {
      success: true;
      data: GeneratedDocuments;
    }
  | {
      success: false;
      error: {
        step: DocumentStep;
        message: string;
      };
    };

export class GenerateDocumentsError extends Error {
  step: DocumentStep;

  constructor(step: DocumentStep, message: string) {
    super(`[${step.toUpperCase()}] ${message}`);
    this.name = "GenerateDocumentsError";
    this.step = step;
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function ensureMarkdownOutput(step: DocumentStep, text: string): string {
  const normalized = cleanMarkdownOutput(text);
  if (normalized.length === 0) {
    throw new GenerateDocumentsError(step, "Model returned empty markdown content.");
  }

  if (containsRawJsonMarkdown(normalized)) {
    throw new GenerateDocumentsError(
      step,
      "Model output still contains raw JSON content after sanitization.",
    );
  }

  return normalized;
}

async function generateStep(params: {
  step: DocumentStep;
  instructions: string;
  prompt: string;
  model?: string;
  maxOutputTokens?: number;
}): Promise<string> {
  try {
    const result = await callOpenAIModel({
      instructions: params.instructions,
      input: params.prompt,
      model: params.model,
      temperature: 0.2,
      maxOutputTokens: params.maxOutputTokens ?? 3500,
    });

    return ensureMarkdownOutput(params.step, result.text);
  } catch (error) {
    if (error instanceof GenerateDocumentsError) {
      throw error;
    }

    throw new GenerateDocumentsError(
      params.step,
      `Failed to generate ${params.step.toUpperCase()}: ${errorMessage(error)}`,
    );
  }
}

export async function generateDocuments(
  input: GenerateDocumentsInput,
): Promise<GeneratedDocuments> {
  const clarification = {
    questions: input.clarificationQuestions ?? null,
    answers: input.clarificationAnswers ?? null,
  };

  const brd = await generateStep({
    step: "brd",
    instructions: BRD_SYSTEM_PROMPT,
    prompt: buildBrdPrompt({
      intake: input.intake,
      clarification,
    }),
    model: input.model,
  });

  const prd = await generateStep({
    step: "prd",
    instructions: PRD_SYSTEM_PROMPT,
    prompt: buildPrdPrompt({
      intake: input.intake,
      clarification,
      brdMarkdown: brd,
    }),
    model: input.model,
  });

  const srs = await generateStep({
    step: "srs",
    instructions: SRS_SYSTEM_PROMPT,
    prompt: buildSrsPrompt({
      intake: input.intake,
      clarification,
      brdMarkdown: brd,
      prdMarkdown: prd,
    }),
    model: input.model,
  });

  const agent = await generateStep({
    step: "agent",
    instructions: AGENT_SYSTEM_PROMPT,
    prompt: buildAgentPrompt({
      intake: input.intake,
      clarification,
      brdMarkdown: brd,
      prdMarkdown: prd,
      srsMarkdown: srs,
    }),
    model: input.model,
    maxOutputTokens: 4200,
  });

  return {
    brd,
    prd,
    srs,
    agent,
  };
}

export async function generateDocumentsSafe(
  input: GenerateDocumentsInput,
): Promise<GenerateDocumentsSafeResult> {
  try {
    const data = await generateDocuments(input);
    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof GenerateDocumentsError) {
      return {
        success: false,
        error: {
          step: error.step,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        step: "brd",
        message: `Document generation failed: ${errorMessage(error)}`,
      },
    };
  }
}
