import { useState, type ReactElement } from "react";
import { AlertTriangle, CheckCircle2, FolderOpen, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatModifiedAt } from "@/lib/format";
import { openLocation } from "@/lib/tauri";
import { getErrorMessage } from "@/lib/utils";
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

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <StatusIcon status={result.status} />
            <div className="min-w-0">
              <p className="font-medium">{result.name}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                {result.severity} severity
              </p>
            </div>
          </div>
          <Badge variant={isDetected ? "detected" : isError ? "warning" : "clean"}>
            {statusLabel(result.status)}
          </Badge>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          {isDetected ? (
            <>
              <InfoRow label="Path" value={result.path} />
              <InfoRow label="Severity" value={result.severity.toUpperCase()} />
              <InfoRow
                label="Last Modified"
                value={formatModifiedAt(result.modifiedAt) ?? "Not available"}
              />
              {foundFiles.length > 0 ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                    Files found
                  </dt>
                  <dd className="mt-1 max-h-36 overflow-y-auto whitespace-pre-wrap break-all text-sm">
                    {foundFiles.join("\n")}
                  </dd>
                </div>
              ) : null}
            </>
          ) : (
            <InfoRow label="Checked" value={result.relativePath || result.path} />
          )}
          {result.error ? <InfoRow label="Error" value={result.error} /> : null}
        </dl>

        {isDetected ? (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleOpen()}
              disabled={isOpening}
            >
              {isOpening ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FolderOpen className="h-4 w-4" />
              )}
              Open Location
            </Button>
            {openError ? (
              <p className="mt-2 text-xs text-destructive">{openError}</p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
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
    return <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />;
  }
  if (status === "ERROR") {
    return <XCircle className="mt-0.5 h-4 w-4 text-warning" />;
  }
  return <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />;
}

function InfoRow({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all text-sm">{value}</dd>
    </div>
  );
}

