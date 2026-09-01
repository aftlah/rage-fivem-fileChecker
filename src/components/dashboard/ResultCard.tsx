import { useState, type ReactElement } from "react";
import { AlertTriangle, CheckCircle2, FolderOpen, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatModifiedAt } from "@/lib/format";
import { openLocation } from "@/lib/tauri";
import { cn, getErrorMessage } from "@/lib/utils";
import type { ScanResult } from "@/scanner/types";

interface ResultCardProps {
  result: ScanResult;
}

export function ResultCard({ result }: ResultCardProps): ReactElement {
  const [isOpening, setIsOpening] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  async function handleOpen(): Promise<void> {
    setIsOpening(true);
    setOpenError(null);
    try {
      await openLocation(result.path);
    } catch (error) {
      setOpenError(getErrorMessage(error));
    } finally {
      setIsOpening(false);
    }
  }

  const foundFiles = result.foundFiles ?? [];
  const isDetected = result.status === "DETECTED";
  const isError = result.status === "ERROR";
  const extraFiles = Math.max(0, foundFiles.length - 6);

  return (
    <Card
      className={cn(
        isDetected && "border-destructive/40 bg-destructive/5",
        isError && "border-warning/40 bg-warning/5",
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <StatusIcon status={result.status} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{result.name}</p>
              <Badge variant={isDetected ? "detected" : isError ? "warning" : "clean"}>
                {statusLabel(result.status)}
              </Badge>
              {isDetected || isError ? (
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {result.severity}
                </span>
              ) : null}
            </div>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {isDetected || isError ? result.path : result.relativePath || result.path}
            </p>
            {isDetected && result.modifiedAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Modified {formatModifiedAt(result.modifiedAt)}
              </p>
            ) : null}
            {foundFiles.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {foundFiles.slice(0, 6).map((file) => (
                  <span
                    key={file}
                    className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {file}
                  </span>
                ))}
                {extraFiles > 0 ? (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    +{extraFiles} more
                  </span>
                ) : null}
              </div>
            ) : null}
            {result.error ? (
              <p className="mt-2 text-xs text-warning">{result.error}</p>
            ) : null}
            {openError ? <p className="mt-2 text-xs text-destructive">{openError}</p> : null}
          </div>
          {isDetected ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => void handleOpen()}
              disabled={isOpening}
              aria-label={`Open ${result.name}`}
            >
              {isOpening ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FolderOpen className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function statusLabel(status: ScanResult["status"]): string {
  if (status === "NOT_FOUND") {
    return "NOT DETECTED";
  }
  return status;
}

function StatusIcon({ status }: { status: ScanResult["status"] }): ReactElement {
  if (status === "DETECTED") {
    return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />;
  }
  if (status === "ERROR") {
    return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />;
  }
  return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />;
}
