import type { ReactElement } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ValidationResult } from "@/scanner/types";

interface ValidationWarningProps {
  validation: ValidationResult;
  onChooseAnother: () => void;
  onUseSuggested?: (path: string) => void;
}

export function ValidationWarning({
  validation,
  onChooseAnother,
  onUseSuggested,
}: ValidationWarningProps): ReactElement {
  return (
    <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-warning">
            FiveM installation could not be verified.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{validation.message}</p>
          {validation.missing.length > 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Missing: {validation.missing.join(", ")}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {validation.suggestedPath && onUseSuggested ? (
              <Button
                type="button"
                size="sm"
                onClick={() => onUseSuggested(validation.suggestedPath ?? "")}
              >
                Use detected folder
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="outline" onClick={onChooseAnother}>
              Choose Another Folder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
