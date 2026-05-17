"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Rocket,
  Sparkles,
} from "lucide-react";
import {
  ClarificationQuestions,
  type ClarificationAnswers,
  type ClarificationQuestion,
} from "@/components/intake/ClarificationQuestions";
import { IntakeWizard } from "@/components/intake/IntakeWizard";
import { type IntakeFormValues } from "@/components/intake/WizardStep";
import { DocumentTabs, type DocumentState } from "@/components/documents/DocumentTabs";
import { DownloadButtons } from "@/components/documents/DownloadButtons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type AnalyzeIntakeResponseData = {
  completenessScore: number;
  missingAreas: string[];
  questions: ClarificationQuestion[];
};

type GenerateResponseData = {
  projectId: string;
  brd: string;
  prd: string;
  srs: string;
  agent: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function resolveApiErrorMessage<T>(payload: ApiResponse<T>, fallbackMessage: string): string {
  if (payload.success) {
    return fallbackMessage;
  }

  const message = payload.error.message?.trim();
  return message && message.length > 0 ? message : fallbackMessage;
}

type GeneratorPhase = "intake" | "clarification" | "documents";

const generationSteps = [
  "Generating BRD",
  "Generating PRD",
  "Generating SRS",
  "Generating AGENT.md",
] as const;

function hasAnyDocumentValue(documents: DocumentState | null) {
  if (!documents) {
    return false;
  }

  return Object.values(documents).some((value) => value.trim().length > 0);
}

export default function GeneratorPage() {
  const { toast } = useToast();

  const [phase, setPhase] = useState<GeneratorPhase>("intake");

  const [intakeValues, setIntakeValues] = useState<IntakeFormValues | null>(null);
  const [analyzedIntake, setAnalyzedIntake] = useState<IntakeFormValues | null>(null);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeIntakeResponseData | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<ClarificationAnswers>({});

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generationStepIndex, setGenerationStepIndex] = useState(-1);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentState | null>(null);
  const [editedDocuments, setEditedDocuments] = useState<DocumentState | null>(null);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const interval = window.setInterval(() => {
      setGenerationStepIndex((previousIndex) =>
        Math.min(previousIndex + 1, generationSteps.length - 1),
      );
    }, 2200);

    return () => {
      window.clearInterval(interval);
    };
  }, [isGenerating]);

  const currentStageLabel = useMemo(() => {
    if (isGenerating) {
      const currentStep =
        generationSteps[generationStepIndex] ?? generationSteps[generationSteps.length - 1];
      return currentStep;
    }

    if (phase === "intake") {
      return "Intake Wizard";
    }

    if (phase === "clarification") {
      return "Clarification Questions";
    }

    return "Generated Documents";
  }, [generationStepIndex, isGenerating, phase]);

  const handleAnalyze = async (values: IntakeFormValues) => {
    try {
      setIsAnalyzing(true);
      setAnalyzeError(null);
      setGenerateError(null);

      const response = await fetch("/api/analyze-intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as ApiResponse<AnalyzeIntakeResponseData>;

      if (!response.ok || !payload.success) {
        const message = resolveApiErrorMessage(
          payload,
          "Analyze intake gagal diproses.",
        );
        throw new Error(message);
      }

      setAnalyzedIntake(values);
      setAnalyzeData(payload.data);
      setClarificationAnswers({});
      setDocuments(null);
      setEditedDocuments(null);
      setProjectId(null);
      setPhase("clarification");

      toast({
        variant: "success",
        title: "Analyze intake berhasil",
        description: `${payload.data.questions.length} pertanyaan klarifikasi disiapkan.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error while analyzing intake.";
      setAnalyzeError(message);
      toast({
        variant: "error",
        title: "Analyze intake gagal",
        description: message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDocuments = async (answers: ClarificationAnswers) => {
    if (!analyzedIntake || !analyzeData) {
      const message =
        "Data analyze belum tersedia. Kembali ke intake wizard lalu jalankan analyze lagi.";
      setGenerateError(message);
      toast({
        variant: "error",
        title: "Generate dibatalkan",
        description: message,
      });
      return;
    }

    try {
      setGenerationStepIndex(0);
      setIsGenerating(true);
      setGenerateError(null);
      setClarificationAnswers(answers);

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          intake: analyzedIntake,
          clarificationQuestions: analyzeData.questions,
          clarificationAnswers: answers,
        }),
      });

      const payload = (await response.json()) as ApiResponse<GenerateResponseData>;
      if (!response.ok || !payload.success) {
        const message = resolveApiErrorMessage(payload, "Generate documents gagal.");
        throw new Error(message);
      }

      const nextDocuments: DocumentState = {
        brd: payload.data.brd,
        prd: payload.data.prd,
        srs: payload.data.srs,
        agent: payload.data.agent,
      };

      setProjectId(payload.data.projectId);
      setDocuments(nextDocuments);
      setEditedDocuments(nextDocuments);
      setPhase("documents");

      toast({
        variant: "success",
        title: "Dokumen berhasil digenerate",
        description: `Project ID: ${payload.data.projectId}`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error while generating documents.";
      setGenerateError(message);
      toast({
        variant: "error",
        title: "Generate documents gagal",
        description: message,
      });
    } finally {
      setIsGenerating(false);
      setGenerationStepIndex(-1);
    }
  };

  const handleSkipClarification = (answers: ClarificationAnswers) => {
    setClarificationAnswers(answers);
    toast({
      variant: "info",
      title: "Clarification di-skip",
      description: "Dokumen akan digenerate menggunakan data intake dan jawaban yang tersedia.",
    });
  };

  const handleBackToIntake = () => {
    setPhase("intake");
    setGenerateError(null);
  };

  const fallbackEmptyStateMessage = useMemo(() => {
    if (phase === "clarification" && !analyzeData) {
      return "Belum ada hasil analyze intake. Jalankan analyze dari wizard terlebih dahulu.";
    }

    if (phase === "documents" && !documents) {
      return "Belum ada dokumen. Lakukan generate dari tahap clarification.";
    }

    return null;
  }, [analyzeData, documents, phase]);

  const clarificationAnsweredCount = useMemo(
    () =>
      Object.values(clarificationAnswers).filter((answer) => answer.trim().length > 0).length,
    [clarificationAnswers],
  );

  const clarificationComponentKey = useMemo(() => {
    if (!analyzeData) {
      return "clarification-empty";
    }

    const scorePart = analyzeData.completenessScore;
    const questionPart = analyzeData.questions.map((question) => question.id).join("|");
    return `clarification-${scorePart}-${questionPart}`;
  }, [analyzeData]);

  return (
    <div className="space-y-6 pb-8">
      <header className="animate-fade-in-up space-y-3">
        <Badge variant="secondary">Generator Workspace</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Spec Generator
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Isi intake wizard, review pertanyaan klarifikasi, lalu generate dan edit
          BRD/PRD/SRS/AGENT dalam satu alur kerja.
        </p>
      </header>

      <Card className="border-border/70 bg-card/85">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Current Stage
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : null}
              {currentStageLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={phase === "intake" ? "default" : "outline"}
              className={cn(phase === "intake" ? "" : "bg-background/70")}
            >
              Intake
            </Badge>
            <Badge
              variant={phase === "clarification" ? "default" : "outline"}
              className={cn(phase === "clarification" ? "" : "bg-background/70")}
            >
              Clarification
            </Badge>
            <Badge
              variant={phase === "documents" ? "default" : "outline"}
              className={cn(phase === "documents" ? "" : "bg-background/70")}
            >
              Documents
            </Badge>
          </div>
        </CardContent>
      </Card>

      {isGenerating ? (
        <GenerationProgressCard stepIndex={generationStepIndex} />
      ) : null}

      {isAnalyzing ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-2 pt-6 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Menganalisis intake untuk menilai kelengkapan data dan menyusun pertanyaan
            klarifikasi...
          </CardContent>
        </Card>
      ) : null}

      {fallbackEmptyStateMessage ? (
        <Card className="border-dashed border-border/80">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{fallbackEmptyStateMessage}</p>
            <Button type="button" variant="outline" onClick={handleBackToIntake}>
              Kembali ke Intake
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {phase === "intake" ? (
        <IntakeWizard
          initialValues={intakeValues ?? undefined}
          isAnalyzing={isAnalyzing}
          analyzeError={analyzeError}
          onValuesChange={setIntakeValues}
          onAnalyze={(values) => void handleAnalyze(values)}
        />
      ) : null}

      {phase === "clarification" && analyzeData ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Tahap klarifikasi membantu menyempurnakan konteks sebelum generate dokumen.
              </p>
              <p className="text-xs text-muted-foreground">
                Jawaban terisi: {clarificationAnsweredCount}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToIntake}
              disabled={isGenerating}
            >
              Edit Intake
            </Button>
          </div>

          <ClarificationQuestions
            key={clarificationComponentKey}
            completenessScore={analyzeData.completenessScore}
            missingAreas={analyzeData.missingAreas}
            questions={analyzeData.questions}
            isGenerating={isGenerating}
            generateError={generateError}
            onAnswersChange={setClarificationAnswers}
            onSkipClarification={handleSkipClarification}
            onGenerateDocuments={(answers) => void handleGenerateDocuments(answers)}
          />
        </div>
      ) : null}

      {phase === "documents" ? (
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b border-border/70">
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  Generated Documents
                </span>
                {projectId ? (
                  <Badge variant="outline" className="bg-background/80">
                    Project ID: {projectId}
                  </Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {generateError ? (
                <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                  {generateError}
                </div>
              ) : null}

              {!hasAnyDocumentValue(documents) ? (
                <div className="rounded-xl border border-dashed border-border/80 bg-background/70 p-4 text-sm text-muted-foreground">
                  Dokumen masih kosong. Kembali ke tahap clarification untuk generate ulang.
                </div>
              ) : null}

              {documents ? (
                <DocumentTabs
                  key={projectId ?? "generated-documents"}
                  initialDocuments={documents}
                  onDocumentsChange={setEditedDocuments}
                />
              ) : null}

              {editedDocuments ? <DownloadButtons documents={editedDocuments} /> : null}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={() => setPhase("clarification")}>
              <Sparkles className="mr-2 h-4 w-4" />
              Kembali ke Clarification
            </Button>
            <Button type="button" variant="secondary" onClick={handleBackToIntake}>
              <Rocket className="mr-2 h-4 w-4" />
              Mulai Intake Baru
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function GenerationProgressCard({ stepIndex }: { stepIndex: number }) {
  const safeStepIndex = stepIndex < 0 ? 0 : stepIndex;

  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardHeader className="border-b border-primary/20">
        <CardTitle className="text-base">Document Generation Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-5">
        {generationSteps.map((stepLabel, index) => {
          const isCompleted = index < safeStepIndex;
          const isActive = index === safeStepIndex;

          return (
            <div
              key={stepLabel}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2 text-sm",
                isActive
                  ? "border-primary/40 bg-primary/10"
                  : "border-border/70 bg-card/80",
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "font-medium",
                  isCompleted ? "text-emerald-700" : isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {stepLabel}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
