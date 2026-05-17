import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { IntakeSchemaInput } from "@/lib/validators/intakeSchema";

export type IntakeFieldName = keyof IntakeSchemaInput;

export type IntakeFieldConfig = {
  name: IntakeFieldName;
  label: string;
  placeholder: string;
  helperText?: string;
  multiline?: boolean;
  required?: boolean;
};

export type IntakeWizardSection = {
  id: string;
  title: string;
  description: string;
  fields: IntakeFieldConfig[];
};

export type IntakeFormValues = Record<IntakeFieldName, string>;
export type IntakeFormErrors = Partial<Record<IntakeFieldName, string>>;

type WizardStepProps = {
  currentStep: number;
  totalSteps: number;
  section: IntakeWizardSection;
  values: IntakeFormValues;
  errors: IntakeFormErrors;
  disabled?: boolean;
  onFieldChange: (fieldName: IntakeFieldName, value: string) => void;
};

export function WizardStep({
  currentStep,
  totalSteps,
  section,
  values,
  errors,
  disabled = false,
  onFieldChange,
}: WizardStepProps) {
  return (
    <Card className="border-border/80 bg-card/95">
      <CardHeader className="space-y-3 border-b border-border/70">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary">
            Step {currentStep} of {totalSteps}
          </Badge>
          <p className="text-xs text-muted-foreground">* Required field</p>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl">{section.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{section.description}</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
        {section.fields.map((field) => {
          const value = values[field.name];
          const error = errors[field.name];
          const isMultiline = field.multiline ?? false;

          return (
            <div
              key={field.name}
              className={cn(
                "space-y-2",
                isMultiline ? "md:col-span-2" : "md:col-span-1",
              )}
            >
              <label
                htmlFor={field.name}
                className={cn(
                  "text-sm font-medium",
                  error ? "text-red-700" : "text-foreground",
                )}
              >
                {field.label}
                {field.required ? <span className="ml-1 text-primary">*</span> : null}
              </label>
              {isMultiline ? (
                <Textarea
                  id={field.name}
                  value={value}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  onChange={(event) =>
                    onFieldChange(field.name, event.currentTarget.value)
                  }
                  aria-invalid={Boolean(error)}
                  className={cn(
                    "min-h-[120px]",
                    error &&
                      "border-red-400 bg-red-50/50 focus-visible:border-red-500 focus-visible:ring-red-200 dark:border-red-700 dark:bg-red-950/30 dark:focus-visible:border-red-600 dark:focus-visible:ring-red-800",
                  )}
                />
              ) : (
                <Input
                  id={field.name}
                  value={value}
                  placeholder={field.placeholder}
                  disabled={disabled}
                  onChange={(event) =>
                    onFieldChange(field.name, event.currentTarget.value)
                  }
                  aria-invalid={Boolean(error)}
                  className={cn(
                    error &&
                      "border-red-400 bg-red-50/50 focus-visible:border-red-500 focus-visible:ring-red-200 dark:border-red-700 dark:bg-red-950/30 dark:focus-visible:border-red-600 dark:focus-visible:ring-red-800",
                  )}
                />
              )}
              {field.helperText ? (
                <p className="text-xs text-muted-foreground">{field.helperText}</p>
              ) : null}
              {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
