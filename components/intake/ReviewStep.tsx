import { FileCheck2, PencilLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  IntakeFieldName,
  IntakeFormValues,
  IntakeWizardSection,
} from "@/components/intake/WizardStep";

type ReviewStepProps = {
  sections: IntakeWizardSection[];
  values: IntakeFormValues;
  onEditSection: (sectionIndex: number) => void;
};

function renderValue(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return <span className="text-muted-foreground">Not provided</span>;
  }

  return <span className="whitespace-pre-wrap">{value}</span>;
}

export function ReviewStep({ sections, values, onEditSection }: ReviewStepProps) {
  return (
    <Card className="border-border/80 bg-card/95">
      <CardHeader className="space-y-3 border-b border-border/70">
        <Badge className="w-fit" variant="secondary">
          Final Review
        </Badge>
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileCheck2 className="h-6 w-6 text-primary" />
            Review Data Sebelum Analyze
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pastikan semua jawaban sudah tepat. Kamu bisa kembali ke step mana
            pun untuk edit sebelum proses analyze.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className="rounded-2xl border border-border/70 bg-background/70 p-4"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEditSection(sectionIndex)}
              >
                <PencilLine className="mr-2 h-4 w-4" />
                Edit Section
              </Button>
            </div>

            <dl className="grid gap-3 md:grid-cols-2">
              {section.fields.map((field) => (
                <div
                  key={field.name}
                  className="rounded-xl border border-border/60 bg-card/70 p-3"
                >
                  <dt className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {field.label}
                  </dt>
                  <dd className="text-sm leading-relaxed">
                    {renderValue(values[field.name as IntakeFieldName])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
