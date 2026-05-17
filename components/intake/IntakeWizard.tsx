"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  Loader2,
  Sparkles,
} from "lucide-react";
import { ReviewStep } from "@/components/intake/ReviewStep";
import {
  type IntakeFieldConfig,
  type IntakeFieldName,
  type IntakeFormErrors,
  type IntakeFormValues,
  type IntakeWizardSection,
  WizardStep,
} from "@/components/intake/WizardStep";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { intakeSchema } from "@/lib/validators/intakeSchema";
import { cn } from "@/lib/utils";

type IntakeWizardProps = {
  initialValues?: Partial<IntakeFormValues>;
  isAnalyzing?: boolean;
  analyzeError?: string | null;
  onAnalyze?: (values: IntakeFormValues) => Promise<void> | void;
  onValuesChange?: (values: IntakeFormValues) => void;
};

const requiredFieldNames: IntakeFieldName[] = [
  "projectName",
  "projectType",
  "projectDescription",
  "businessProblem",
  "businessGoals",
  "targetUsers",
  "mainFeatures",
  "preferredTechStack",
];

const requiredFieldSet = new Set<IntakeFieldName>(requiredFieldNames);

function field(
  name: IntakeFieldName,
  label: string,
  placeholder: string,
  options?: Pick<IntakeFieldConfig, "helperText" | "multiline">,
): IntakeFieldConfig {
  return {
    name,
    label,
    placeholder,
    helperText: options?.helperText,
    multiline: options?.multiline,
    required: requiredFieldSet.has(name),
  };
}

const wizardSections: IntakeWizardSection[] = [
  {
    id: "basic-project-info",
    title: "Basic Project Info",
    description: "Isi fondasi utama proyek yang akan dianalisis.",
    fields: [
      field("projectName", "Project Name", "Contoh: SpecBuilder AI Platform"),
      field("projectType", "Project Type", "Contoh: SaaS, Internal Tool, Mobile App"),
      field(
        "projectDescription",
        "Project Description",
        "Jelaskan project secara ringkas, masalah yang ingin diselesaikan, dan nilai utamanya.",
        { multiline: true },
      ),
      field("projectStage", "Project Stage", "Contoh: Idea, MVP, Growth"),
      field(
        "platformTarget",
        "Platform Target",
        "Contoh: Web, iOS, Android, Multi-platform",
      ),
      field("industry", "Industry", "Contoh: FinTech, HealthTech, EdTech"),
    ],
  },
  {
    id: "business-context",
    title: "Business Context",
    description: "Tentukan konteks bisnis dan target hasil proyek.",
    fields: [
      field(
        "businessProblem",
        "Business Problem",
        "Masalah bisnis utama yang ingin diselesaikan.",
        { multiline: true },
      ),
      field(
        "businessGoals",
        "Business Goals",
        "Tujuan bisnis yang ingin dicapai dalam 3-12 bulan.",
        { multiline: true },
      ),
      field(
        "targetMarket",
        "Target Market",
        "Segmen pasar utama, wilayah, dan karakter umum customer.",
      ),
      field(
        "stakeholders",
        "Stakeholders",
        "Daftar stakeholder penting: sponsor, PM, engineering, legal, dsb.",
      ),
      field("revenueModel", "Revenue Model", "Contoh: Subscription, One-time, Freemium"),
      field(
        "successMetrics",
        "Success Metrics",
        "Contoh: Activation rate, MRR, churn, conversion rate",
      ),
      field("budgetRange", "Budget Range", "Contoh: <50K, 50K-200K, >200K"),
      field(
        "timelineExpectation",
        "Timeline Expectation",
        "Contoh: MVP 3 bulan, GA 6 bulan",
      ),
    ],
  },
  {
    id: "product-context",
    title: "Product Context",
    description: "Rinci pengguna, fitur, dan batasan ruang lingkup produk.",
    fields: [
      field(
        "targetUsers",
        "Target Users",
        "Siapa pengguna utama dan kebutuhan utama mereka?",
        { multiline: true },
      ),
      field(
        "userPersonas",
        "User Personas",
        "Persona utama user dan pain point per persona.",
        { multiline: true },
      ),
      field(
        "mainFeatures",
        "Main Features",
        "Daftar fitur inti yang wajib ada pada versi awal.",
        { multiline: true },
      ),
      field("userRoles", "User Roles", "Contoh: Admin, Manager, Staff, Viewer"),
      field(
        "userJourney",
        "User Journey",
        "Alur end-to-end user dari onboarding sampai outcome utama.",
        { multiline: true },
      ),
      field(
        "productScope",
        "Product Scope",
        "Ruang lingkup pekerjaan yang masuk fase ini.",
        { multiline: true },
      ),
      field(
        "outOfScope",
        "Out Of Scope",
        "Hal-hal yang sengaja tidak dikerjakan di fase ini.",
        { multiline: true },
      ),
      field(
        "competitorReferences",
        "Competitor References",
        "Produk pembanding atau benchmark fitur.",
        { multiline: true },
      ),
    ],
  },
  {
    id: "technical-context",
    title: "Technical Context",
    description: "Definisikan preferensi arsitektur dan kebutuhan integrasi.",
    fields: [
      field(
        "preferredTechStack",
        "Preferred Tech Stack",
        "Contoh: Next.js, Node.js, Prisma, PostgreSQL",
      ),
      field(
        "frontendPreference",
        "Frontend Preference",
        "Framework, library UI, design system, atau standar FE.",
      ),
      field(
        "backendPreference",
        "Backend Preference",
        "Framework backend, style API, service boundaries.",
      ),
      field(
        "databasePreference",
        "Database Preference",
        "Relasional/NoSQL, alasan, dan kebutuhan data utama.",
      ),
      field(
        "authenticationNeeds",
        "Authentication Needs",
        "Kebutuhan auth: SSO, OAuth, MFA, role-based login.",
        { multiline: true },
      ),
      field(
        "apiIntegrations",
        "API Integrations",
        "Integrasi API eksternal yang wajib tersedia.",
        { multiline: true },
      ),
      field(
        "thirdPartyServices",
        "Third Party Services",
        "Tools pihak ketiga: analytics, email, payment, dsb.",
        { multiline: true },
      ),
      field(
        "deploymentTarget",
        "Deployment Target",
        "Contoh: Vercel, AWS, GCP, on-premise",
      ),
      field(
        "scalabilityNeeds",
        "Scalability Needs",
        "Ekspektasi trafik, data growth, dan target performa.",
        { multiline: true },
      ),
    ],
  },
  {
    id: "security-compliance",
    title: "Security & Compliance",
    description: "Jelaskan kebutuhan keamanan, privasi, dan kepatuhan regulasi.",
    fields: [
      field(
        "securityRequirements",
        "Security Requirements",
        "Persyaratan keamanan aplikasi dan infrastruktur.",
        { multiline: true },
      ),
      field(
        "privacyRequirements",
        "Privacy Requirements",
        "Aturan privasi dan perlindungan data pengguna.",
        { multiline: true },
      ),
      field(
        "complianceNeeds",
        "Compliance Needs",
        "Kepatuhan standar/regulasi: GDPR, HIPAA, ISO, dsb.",
        { multiline: true },
      ),
      field(
        "userDataTypes",
        "User Data Types",
        "Jenis data user yang disimpan atau diproses.",
      ),
      field(
        "accessControlRules",
        "Access Control Rules",
        "Aturan akses berdasarkan role/permission.",
        { multiline: true },
      ),
      field(
        "backupRequirements",
        "Backup Requirements",
        "Kebutuhan backup, restore, dan disaster recovery.",
        { multiline: true },
      ),
    ],
  },
  {
    id: "ai-agent-rules",
    title: "AI Agent Rules",
    description: "Atur preferensi cara AI agent bekerja untuk proyek ini.",
    fields: [
      field(
        "codingStyle",
        "Coding Style",
        "Contoh: clean architecture, naming convention, strict typing",
      ),
      field(
        "folderStructurePreference",
        "Folder Structure Preference",
        "Preferensi struktur folder dan modularisasi.",
      ),
      field(
        "testingPreference",
        "Testing Preference",
        "Jenis testing yang diutamakan: unit, integration, e2e.",
      ),
      field(
        "documentationPreference",
        "Documentation Preference",
        "Standar dokumentasi untuk code/API/arsitektur.",
      ),
      field("gitWorkflow", "Git Workflow", "Contoh: trunk-based, gitflow, PR policy"),
      field(
        "aiAgentBehavior",
        "AI Agent Behavior",
        "Aturan perilaku agent saat coding/review/refactor.",
        { multiline: true },
      ),
      field(
        "restrictedActions",
        "Restricted Actions",
        "Aksi yang dilarang dilakukan AI agent.",
        { multiline: true },
      ),
      field(
        "definitionOfDone",
        "Definition Of Done",
        "Kriteria selesai untuk task engineering.",
        { multiline: true },
      ),
    ],
  },
];

const allStepLabels = [...wizardSections.map((section) => section.title), "Review"];
const reviewStepIndex = wizardSections.length;

const fieldLabelByName = wizardSections.reduce<Record<IntakeFieldName, string>>(
  (accumulator, section) => {
    for (const intakeField of section.fields) {
      accumulator[intakeField.name] = intakeField.label;
    }
    return accumulator;
  },
  {} as Record<IntakeFieldName, string>,
);

function createInitialValues(initialValues?: Partial<IntakeFormValues>) {
  const values = {} as IntakeFormValues;
  for (const section of wizardSections) {
    for (const intakeField of section.fields) {
      values[intakeField.name] = initialValues?.[intakeField.name] ?? "";
    }
  }
  return values;
}

export function IntakeWizard({
  initialValues,
  isAnalyzing = false,
  analyzeError,
  onAnalyze,
  onValuesChange,
}: IntakeWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<IntakeFormValues>(() =>
    createInitialValues(initialValues),
  );
  const [errors, setErrors] = useState<IntakeFormErrors>({});
  const [validationHint, setValidationHint] = useState<string | null>(null);

  useEffect(() => {
    onValuesChange?.(values);
  }, [onValuesChange, values]);

  const currentSection = wizardSections[currentStep];
  const isReviewStep = currentStep === reviewStepIndex;
  const progressPercent = useMemo(
    () => Math.round(((currentStep + 1) / allStepLabels.length) * 100),
    [currentStep],
  );

  const requiredMissingCount = useMemo(
    () =>
      requiredFieldNames.filter((fieldName) => values[fieldName].trim().length === 0).length,
    [values],
  );

  const handleFieldChange = (fieldName: IntakeFieldName, value: string) => {
    setValues((previousValues) => ({
      ...previousValues,
      [fieldName]: value,
    }));

    setErrors((previousErrors) => {
      if (!previousErrors[fieldName]) {
        return previousErrors;
      }

      const nextErrors = { ...previousErrors };
      delete nextErrors[fieldName];
      return nextErrors;
    });

    if (validationHint) {
      setValidationHint(null);
    }
  };

  const validateCurrentStep = () => {
    if (isReviewStep) {
      return true;
    }

    const nextErrors: IntakeFormErrors = { ...errors };
    let hasError = false;

    for (const intakeField of currentSection.fields) {
      const fieldName = intakeField.name;
      if (!intakeField.required) {
        continue;
      }

      if (values[fieldName].trim().length === 0) {
        nextErrors[fieldName] = `${intakeField.label} wajib diisi.`;
        hasError = true;
      } else {
        delete nextErrors[fieldName];
      }
    }

    setErrors(nextErrors);
    if (hasError) {
      setValidationHint("Lengkapi semua field wajib pada step ini sebelum lanjut.");
    }

    return !hasError;
  };

  const validateAllRequiredFields = () => {
    const result = intakeSchema.safeParse(values);
    if (result.success) {
      setErrors({});
      setValidationHint(null);
      return true;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    const nextErrors: IntakeFormErrors = {};
    for (const fieldName of requiredFieldNames) {
      const fieldError = fieldErrors[fieldName];
      if (fieldError && fieldError.length > 0) {
        const fieldLabel = fieldLabelByName[fieldName] ?? fieldName;
        nextErrors[fieldName] = `${fieldLabel} wajib diisi.`;
      }
    }
    setErrors(nextErrors);
    setValidationHint(
      "Masih ada field wajib yang belum valid. Buka step terkait dan lengkapi data.",
    );
    return false;
  };

  const handleNext = () => {
    if (isReviewStep || isAnalyzing) {
      return;
    }

    const isLastFormStep = currentStep === wizardSections.length - 1;
    const isStepValid = validateCurrentStep();

    if (!isStepValid) {
      return;
    }

    if (isLastFormStep) {
      const isWholeFormValid = validateAllRequiredFields();
      if (!isWholeFormValid) {
        return;
      }
    }

    setCurrentStep((previousStep) =>
      Math.min(previousStep + 1, allStepLabels.length - 1),
    );
    setValidationHint(null);
  };

  const handleBack = () => {
    if (isAnalyzing) {
      return;
    }

    setCurrentStep((previousStep) => Math.max(previousStep - 1, 0));
    setValidationHint(null);
  };

  const handleAnalyze = async () => {
    if (!onAnalyze || isAnalyzing) {
      return;
    }

    const valid = validateAllRequiredFields();
    if (!valid) {
      return;
    }

    await onAnalyze(values);
  };

  return (
    <div className="space-y-5">
      <CardHeaderPanel
        currentStep={currentStep}
        progressPercent={progressPercent}
        totalSteps={allStepLabels.length}
        requiredMissingCount={requiredMissingCount}
      />

      <StepperBar currentStep={currentStep} labels={allStepLabels} />

      {isReviewStep ? (
        <ReviewStep
          sections={wizardSections}
          values={values}
          onEditSection={(sectionIndex) => !isAnalyzing && setCurrentStep(sectionIndex)}
        />
      ) : (
        <WizardStep
          currentStep={currentStep + 1}
          totalSteps={allStepLabels.length}
          section={currentSection}
          values={values}
          errors={errors}
          disabled={isAnalyzing}
          onFieldChange={handleFieldChange}
        />
      )}

      {validationHint ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300">
          {validationHint}
        </div>
      ) : null}

      {analyzeError ? (
        <div className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
          {analyzeError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/75 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {isReviewStep
            ? "Review selesai. Klik Analyze Intake untuk menghasilkan pertanyaan klarifikasi."
            : "Isi field yang diperlukan lalu lanjut ke step berikutnya."}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isAnalyzing}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {isReviewStep ? (
            <Button type="button" onClick={() => void handleAnalyze()} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing Intake..." : "Analyze Intake"}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext} disabled={isAnalyzing}>
              {currentStep === wizardSections.length - 1 ? "Review" : "Next"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type StepperBarProps = {
  currentStep: number;
  labels: string[];
};

function StepperBar({ currentStep, labels }: StepperBarProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-3">
      <ol className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {labels.map((label, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <li
              key={label}
              className={cn(
                "rounded-xl border px-3 py-2 text-left transition-colors",
                isActive
                  ? "border-primary/60 bg-primary/10 text-foreground"
                  : "border-border/60 bg-background/70 text-muted-foreground",
              )}
            >
              <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase">
                {isDone ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                {index + 1}
              </span>
              <p className="line-clamp-2 text-xs leading-tight">{label}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

type CardHeaderPanelProps = {
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  requiredMissingCount: number;
};

function CardHeaderPanel({
  currentStep,
  totalSteps,
  progressPercent,
  requiredMissingCount,
}: CardHeaderPanelProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/85 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary" className="gap-1">
          <ListChecks className="h-3.5 w-3.5" />
          AI Project Intake Wizard
        </Badge>
        <span className="text-xs font-medium text-muted-foreground">
          Step {currentStep + 1} / {totalSteps}
        </span>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Lengkapi data proyek secara bertahap, review hasilnya, lalu lanjut ke
          tahap analyze untuk klarifikasi.
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted/70">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p
          className={cn(
            "inline-flex items-center gap-1 text-xs",
            requiredMissingCount > 0 ? "text-amber-700" : "text-emerald-700",
          )}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          {requiredMissingCount > 0
            ? `${requiredMissingCount} field wajib belum terisi`
            : "Semua field wajib sudah terisi"}
        </p>
      </div>
    </div>
  );
}
