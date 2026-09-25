import { CheckCircle2, Loader2 } from "lucide-react";

export type OcrProgressStage = "optimizing" | "reading" | "updating";

interface OcrProgressStepperProps {
  stage: OcrProgressStage;
}

const STEPS: { id: OcrProgressStage; label: string }[] = [
  { id: "optimizing", label: "Optimizing" },
  { id: "reading", label: "Reading tag" },
  { id: "updating", label: "Updating form" },
];

function getStepStatus(
  stepId: OcrProgressStage,
  currentStage: OcrProgressStage,
): "complete" | "active" | "pending" {
  const order = STEPS.map((step) => step.id);
  const currentIndex = order.indexOf(currentStage);
  const stepIndex = order.indexOf(stepId);

  if (stepIndex < currentIndex) return "complete";
  if (stepIndex === currentIndex) return "active";
  return "pending";
}

function StepIndicator({ status }: { status: "complete" | "active" | "pending" }) {
  if (status === "complete") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />;
  }

  if (status === "active") {
    return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />;
  }

  return (
    <span
      className="inline-block h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30"
      aria-hidden
    />
  );
}

export function OcrProgressStepper({ stage }: OcrProgressStepperProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-3"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-xs sm:text-sm">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id, stage);
          const isActive = status === "active";
          const isComplete = status === "complete";

          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 ${
                  isActive
                    ? "font-medium text-blue-700"
                    : isComplete
                      ? "text-green-700"
                      : "text-muted-foreground"
                }`}
              >
                <StepIndicator status={status} />
                <span>{step.label}</span>
              </div>
              {index < STEPS.length - 1 && (
                <span className="text-muted-foreground" aria-hidden>
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const waitForOcrStepVisibility = (ms = 250): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
