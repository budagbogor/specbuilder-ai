"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type ClarificationQuestion = {
  id: string;
  area: string;
  question: string;
  reason: string;
  required: boolean;
};

export type ClarificationAnswers = Record<string, string>;

type ClarificationQuestionsProps = {
  completenessScore: number;
  missingAreas: string[];
  questions: ClarificationQuestion[];
  isGenerating?: boolean;
  generateError?: string | null;
  onAnswersChange?: (answers: ClarificationAnswers) => void;
  onAnswerQuestions?: (answers: ClarificationAnswers) => void;
  onSkipClarification?: (answers: ClarificationAnswers) => void;
  onGenerateDocuments?: (answers: ClarificationAnswers) => void;
};

function buildInitialAnswers(questions: ClarificationQuestion[]): ClarificationAnswers {
  const draft: ClarificationAnswers = {};
  for (const question of questions) {
    draft[question.id] = "";
  }
  return draft;
}

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export function ClarificationQuestions({
  completenessScore,
  missingAreas,
  questions,
  isGenerating = false,
  generateError = null,
  onAnswersChange,
  onAnswerQuestions,
  onSkipClarification,
  onGenerateDocuments,
}: ClarificationQuestionsProps) {
  const [isAnswerMode, setIsAnswerMode] = useState(false);
  const [answers, setAnswers] = useState<ClarificationAnswers>(() =>
    buildInitialAnswers(questions),
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const scopedAnswers = useMemo(() => {
    const nextAnswers: ClarificationAnswers = {};
    for (const question of questions) {
      nextAnswers[question.id] = answers[question.id] ?? "";
    }
    return nextAnswers;
  }, [answers, questions]);

  useEffect(() => {
    onAnswersChange?.(scopedAnswers);
  }, [onAnswersChange, scopedAnswers]);

  const normalizedScore = Math.max(0, Math.min(100, Math.round(completenessScore)));
  const answeredCount = useMemo(
    () => questions.filter((question) => hasValue(scopedAnswers[question.id])).length,
    [questions, scopedAnswers],
  );
  const requiredUnansweredCount = useMemo(
    () =>
      questions.filter(
        (question) => question.required && !hasValue(scopedAnswers[question.id]),
      )
        .length,
    [questions, scopedAnswers],
  );

  const handleAnswerMode = () => {
    if (isGenerating) {
      return;
    }

    setActionError(null);
    setIsAnswerMode(true);
    onAnswerQuestions?.(scopedAnswers);
  };

  const handleSkipClarification = () => {
    if (isGenerating) {
      return;
    }

    setActionError(null);
    onSkipClarification?.(scopedAnswers);
  };

  const handleGenerateDocuments = () => {
    if (isGenerating) {
      return;
    }

    if (isAnswerMode && requiredUnansweredCount > 0) {
      setActionError("Masih ada pertanyaan wajib yang belum dijawab.");
      return;
    }

    setActionError(null);
    onGenerateDocuments?.(scopedAnswers);
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="border-b border-border/70">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Clarification Stage
              </Badge>
              <CardTitle className="text-2xl">Intake Clarification Questions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review area yang masih open question, lalu isi jawaban klarifikasi
                sebelum lanjut generate dokumen.
              </p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Completeness Score
              </p>
              <p className="text-2xl font-semibold text-primary">{normalizedScore}%</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Missing Areas
            </h3>
            {missingAreas.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/75 p-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Tidak ada missing area yang terdeteksi.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingAreas.map((area, index) => (
                  <span
                    key={`${area}-${index + 1}`}
                    className="inline-flex items-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
                Questions ({answeredCount}/{questions.length} answered)
              </h3>
              {requiredUnansweredCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {requiredUnansweredCount} required question belum dijawab
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Semua pertanyaan wajib sudah terisi
                </span>
              )}
            </div>

            {questions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/80 bg-background/75 p-4 text-sm text-muted-foreground">
                Tidak ada pertanyaan klarifikasi tambahan dari analisis intake.
                Kamu bisa langsung lanjut generate dokumen.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => {
                  const answer = answers[question.id] ?? "";
                  const isAnswerEmpty = !hasValue(answer);

                  return (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-border/70 bg-background/70 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant="secondary">{question.area}</Badge>
                        {question.required ? (
                          <Badge className="bg-[oklch(0.94_0.07_80)] text-[oklch(0.45_0.12_80)]">
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline">Optional</Badge>
                        )}
                      </div>

                      <p className="text-sm font-semibold">{question.question}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reason: {question.reason}
                      </p>

                      <div className="mt-3 space-y-2">
                        <Textarea
                          value={answer}
                          onChange={(event) =>
                            setAnswers((previousAnswers) => ({
                              ...previousAnswers,
                              [question.id]: event.currentTarget.value,
                            }))
                          }
                          className="min-h-[100px]"
                          placeholder="Tulis jawaban klarifikasi untuk pertanyaan ini..."
                          disabled={!isAnswerMode || isGenerating}
                        />
                        {isAnswerMode && question.required && isAnswerEmpty ? (
                          <p className="text-xs font-medium text-amber-700">
                            Jawaban wajib untuk pertanyaan ini masih kosong.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {generateError ? (
            <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
              {generateError}
            </div>
          ) : null}

          {actionError ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300">
              {actionError}
            </div>
          ) : null}

          <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Pilih lanjut jawab klarifikasi, skip, atau langsung lanjut ke tahap
              generate dokumen.
            </p>
            <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
              <Button
                type="button"
                variant={isAnswerMode ? "secondary" : "default"}
                onClick={handleAnswerMode}
                disabled={isGenerating}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Answer Questions
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSkipClarification}
                disabled={isGenerating}
              >
                Skip Clarification
              </Button>
              <Button
                type="button"
                className={cn(requiredUnansweredCount > 0 && "opacity-80")}
                onClick={handleGenerateDocuments}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isGenerating ? "Generating..." : "Generate Documents"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
