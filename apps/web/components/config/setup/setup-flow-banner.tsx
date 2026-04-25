import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import { SectionHeader } from "@tbms/ui/components/section-header";

interface SetupFlowBannerProps {
  title: string;
  description: string;
  currentStep: string;
  previousStep?: string;
  nextStep?: string;
  sequence: string[];
}

export function SetupFlowBanner({
  title,
  description,
  currentStep,
  previousStep,
  nextStep,
  sequence,
}: SetupFlowBannerProps) {
  const currentStepIndex = Math.max(
    sequence.findIndex((step) => step === currentStep),
    0,
  );
  const currentStepNumber = currentStepIndex + 1;
  const totalSteps = sequence.length;

  return (
    <Card>
      <CardHeader>
        <SectionHeader
          title={title}
          description={description}
          icon={<Sparkles className="h-4 w-4 text-primary" />}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-semibold">
            Step {currentStepNumber} of {totalSteps}
          </Badge>
          <Badge variant="default" className="font-semibold">
            {currentStep}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {sequence.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <Badge
                variant={step === currentStep ? "default" : "secondary"}
                className="font-semibold"
              >
                {step}
              </Badge>
              {index < sequence.length - 1 ? (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              ) : null}
            </div>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border bg-muted/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Before
            </p>
            <p className="mt-1 font-semibold text-foreground">
              {previousStep || "You are starting the setup flow here"}
            </p>
          </div>
          <div className="rounded-md border border-primary/40 bg-primary/5 px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              This page
            </p>
            <p className="mt-1 font-semibold text-foreground">{currentStep}</p>
          </div>
          <div className="rounded-md border bg-muted/10 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              After
            </p>
            <div className="mt-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <p className="font-semibold text-foreground">
                {nextStep || "Ready to use in live operations"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
