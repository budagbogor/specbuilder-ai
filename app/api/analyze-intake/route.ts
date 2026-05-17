import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ANALYZE_INTAKE_SYSTEM_PROMPT,
  buildAnalyzeIntakePrompt,
} from "@/lib/prompts/analyzeIntakePrompt";
import { callOpenAIModel } from "@/lib/openai";
import { intakeSchema, type IntakeSchemaValues } from "@/lib/validators/intakeSchema";

type QuestionArea =
  | "business"
  | "product"
  | "technical"
  | "security"
  | "compliance"
  | "ai-workflow"
  | "general";

type AnalyzeIntakeData = {
  completenessScore: number;
  missingAreas: string[];
  questions: Array<{
    id: string;
    area: QuestionArea;
    question: string;
    reason: string;
    required: boolean;
  }>;
};

const questionAreaSchema = z.enum([
  "business",
  "product",
  "technical",
  "security",
  "compliance",
  "ai-workflow",
  "general",
]);

const analyzeIntakeOutputSchema = z.object({
  completenessScore: z.coerce.number().int().min(0).max(100),
  missingAreas: z.array(z.string().trim()),
  questions: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        area: questionAreaSchema,
        question: z.string().trim().min(1),
        reason: z.string().trim().min(1),
        required: z.boolean(),
      }),
    )
    .max(10),
});

const fallbackQuestionTemplates: Array<{
  key: keyof IntakeSchemaValues;
  area: QuestionArea;
  question: string;
  reason: string;
  required: boolean;
}> = [
  {
    key: "timelineExpectation",
    area: "business",
    question:
      "Apa target timeline untuk milestone utama (discovery, MVP, beta, production)?",
    reason:
      "Timeline mempengaruhi prioritas requirement dan detail rencana implementasi di BRD, PRD, dan SRS.",
    required: true,
  },
  {
    key: "successMetrics",
    area: "business",
    question:
      "Metrik sukses apa yang paling penting untuk menilai keberhasilan produk?",
    reason:
      "Metrik sukses dibutuhkan untuk memvalidasi tujuan bisnis dan acceptance criteria lintas dokumen.",
    required: true,
  },
  {
    key: "stakeholders",
    area: "business",
    question:
      "Siapa stakeholder kunci dan siapa decision maker utama untuk requirement final?",
    reason:
      "Pemetaan stakeholder penting untuk governance, approval flow, dan prioritas scope.",
    required: true,
  },
  {
    key: "productScope",
    area: "product",
    question: "Apa scope fitur yang wajib masuk fase ini?",
    reason:
      "Scope yang jelas menghindari over-engineering dan membantu penyusunan requirement yang terukur.",
    required: true,
  },
  {
    key: "outOfScope",
    area: "product",
    question: "Apa yang secara eksplisit di luar scope fase ini?",
    reason:
      "Out-of-scope diperlukan agar BRD/PRD tidak ambigu dan AGENT.md punya guardrail kerja yang jelas.",
    required: true,
  },
  {
    key: "userJourney",
    area: "product",
    question:
      "Bagaimana alur utama user dari entry point sampai mencapai outcome inti?",
    reason:
      "User journey mempengaruhi struktur flow, API boundaries, dan skenario validasi di SRS.",
    required: true,
  },
  {
    key: "authenticationNeeds",
    area: "technical",
    question: "Kebutuhan autentikasi dan otorisasi apa yang wajib didukung?",
    reason:
      "Auth requirements berpengaruh langsung ke arsitektur teknis, model data, dan keamanan sistem.",
    required: true,
  },
  {
    key: "apiIntegrations",
    area: "technical",
    question: "API integrasi eksternal apa saja yang wajib tersedia di versi awal?",
    reason:
      "Integrasi eksternal berdampak pada desain interface, error handling, dan dependensi delivery.",
    required: true,
  },
  {
    key: "complianceNeeds",
    area: "compliance",
    question: "Regulasi atau standar compliance apa yang harus dipenuhi?",
    reason:
      "Compliance menentukan kontrol data, logging, dan persyaratan non-fungsional di SRS.",
    required: true,
  },
  {
    key: "definitionOfDone",
    area: "ai-workflow",
    question:
      "Apa definition of done teknis untuk task yang dikerjakan AI coding assistant?",
    reason:
      "Definition of done penting untuk AGENT.md dan kualitas eksekusi engineering yang konsisten.",
    required: false,
  },
  {
    key: "deploymentTarget",
    area: "technical",
    question: "Target environment deployment utama apa yang akan dipakai?",
    reason:
      "Environment deployment mempengaruhi arsitektur infrastruktur, observability, dan rencana release.",
    required: false,
  },
];

const missingAreaLabels: Record<keyof IntakeSchemaValues, { area: QuestionArea; label: string }> =
  {
    projectName: { area: "general", label: "projectName" },
    projectType: { area: "general", label: "projectType" },
    projectDescription: { area: "general", label: "projectDescription" },
    projectStage: { area: "general", label: "project stage" },
    platformTarget: { area: "technical", label: "platform target" },
    industry: { area: "business", label: "industry context" },
    businessProblem: { area: "business", label: "business problem" },
    businessGoals: { area: "business", label: "business goals" },
    targetMarket: { area: "business", label: "target market" },
    stakeholders: { area: "business", label: "stakeholders" },
    revenueModel: { area: "business", label: "revenue model" },
    successMetrics: { area: "business", label: "success metrics" },
    budgetRange: { area: "business", label: "budget range" },
    timelineExpectation: { area: "business", label: "timeline expectation" },
    targetUsers: { area: "product", label: "target users" },
    userPersonas: { area: "product", label: "user personas" },
    mainFeatures: { area: "product", label: "main features" },
    userRoles: { area: "product", label: "user roles" },
    userJourney: { area: "product", label: "user journey" },
    productScope: { area: "product", label: "product scope" },
    outOfScope: { area: "product", label: "out of scope" },
    competitorReferences: { area: "product", label: "competitor references" },
    preferredTechStack: { area: "technical", label: "preferred tech stack" },
    frontendPreference: { area: "technical", label: "frontend preference" },
    backendPreference: { area: "technical", label: "backend preference" },
    databasePreference: { area: "technical", label: "database preference" },
    authenticationNeeds: { area: "security", label: "authentication needs" },
    apiIntegrations: { area: "technical", label: "API integrations" },
    thirdPartyServices: { area: "technical", label: "third-party services" },
    deploymentTarget: { area: "technical", label: "deployment target" },
    scalabilityNeeds: { area: "technical", label: "scalability needs" },
    securityRequirements: { area: "security", label: "security requirements" },
    privacyRequirements: { area: "security", label: "privacy requirements" },
    complianceNeeds: { area: "compliance", label: "compliance needs" },
    userDataTypes: { area: "security", label: "user data types" },
    accessControlRules: { area: "security", label: "access control rules" },
    backupRequirements: { area: "security", label: "backup requirements" },
    codingStyle: { area: "ai-workflow", label: "coding style" },
    folderStructurePreference: {
      area: "ai-workflow",
      label: "folder structure preference",
    },
    testingPreference: { area: "ai-workflow", label: "testing preference" },
    documentationPreference: {
      area: "ai-workflow",
      label: "documentation preference",
    },
    gitWorkflow: { area: "ai-workflow", label: "git workflow" },
    aiAgentBehavior: { area: "ai-workflow", label: "AI agent behavior" },
    restrictedActions: { area: "ai-workflow", label: "restricted actions" },
    definitionOfDone: { area: "ai-workflow", label: "definition of done" },
  };

function hasValue(value: unknown): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value && typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return Boolean(value);
}

function tryParseJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function parseAnalyzeIntakeOutput(rawText: string): AnalyzeIntakeData | null {
  const parseCandidates: string[] = [];

  if (rawText.trim().length > 0) {
    parseCandidates.push(rawText.trim());
  }

  const fencedJsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedJsonMatch?.[1]) {
    parseCandidates.push(fencedJsonMatch[1].trim());
  }

  const fencedAnyMatch = rawText.match(/```[\w-]*\s*([\s\S]*?)\s*```/i);
  if (fencedAnyMatch?.[1]) {
    parseCandidates.push(fencedAnyMatch[1].trim());
  }

  const objectStart = rawText.indexOf("{");
  const objectEnd = rawText.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    parseCandidates.push(rawText.slice(objectStart, objectEnd + 1).trim());
  }

  for (const candidate of parseCandidates) {
    const parsedCandidate = tryParseJson(candidate);
    if (!parsedCandidate) {
      continue;
    }

    const parsedOutput = analyzeIntakeOutputSchema.safeParse(parsedCandidate);
    if (!parsedOutput.success) {
      continue;
    }

    return normalizeAnalyzeIntakeData(parsedOutput.data);
  }

  return null;
}

function normalizeAnalyzeIntakeData(
  data: z.infer<typeof analyzeIntakeOutputSchema>,
): AnalyzeIntakeData {
  const sanitizedQuestions = data.questions.slice(0, 10).map((question, index) => ({
    id: `q${index + 1}`,
    area: question.area,
    question: question.question.trim(),
    reason: question.reason.trim(),
    required: question.required,
  }));

  const sanitizedMissingAreas = data.missingAreas
    .map((area) => area.trim())
    .filter((area) => area.length > 0);

  return {
    completenessScore: Math.max(0, Math.min(100, Math.round(data.completenessScore))),
    missingAreas: sanitizedMissingAreas,
    questions: sanitizedQuestions,
  };
}

function buildAnalyzeFallback(intake: IntakeSchemaValues): AnalyzeIntakeData {
  const intakeEntries = Object.entries(intake) as Array<[keyof IntakeSchemaValues, unknown]>;
  const filledCount = intakeEntries.filter(([, value]) => hasValue(value)).length;
  const totalCount = intakeEntries.length;
  const completenessScore =
    totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  const missingAreas: string[] = [];
  for (const [fieldKey, fieldValue] of intakeEntries) {
    if (hasValue(fieldValue)) {
      continue;
    }

    const metadata = missingAreaLabels[fieldKey];
    missingAreas.push(
      `open question: ${metadata.area} - ${metadata.label} - Not specified by user`,
    );
  }

  const questions = fallbackQuestionTemplates
    .filter((template) => !hasValue(intake[template.key]))
    .slice(0, 10)
    .map((template, index) => ({
      id: `q${index + 1}`,
      area: template.area,
      question: template.question,
      reason: template.reason,
      required: template.required,
    }));

  return {
    completenessScore,
    missingAreas,
    questions,
  };
}

export async function POST(request: Request) {
  try {
    const rawBody: unknown = await request.json();
    const validationResult = intakeSchema.safeParse(rawBody);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat().find((message) => Boolean(message)) ??
        "Invalid intake payload.";

      return NextResponse.json(
        {
          success: false,
          error: firstError,
        },
        { status: 400 },
      );
    }

    const intakeData = validationResult.data;
    const prompt = buildAnalyzeIntakePrompt(intakeData);

    const aiResult = await callOpenAIModel({
      instructions: ANALYZE_INTAKE_SYSTEM_PROMPT,
      input: prompt,
      temperature: 0.1,
      maxOutputTokens: 1800,
    });

    const parsedAiData = parseAnalyzeIntakeOutput(aiResult.text);
    const responseData = parsedAiData ?? buildAnalyzeFallback(intakeData);

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error while analyzing intake.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
