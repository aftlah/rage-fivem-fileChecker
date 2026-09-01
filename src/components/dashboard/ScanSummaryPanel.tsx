import type { ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ScanSummary } from "@/scanner/types";

interface ScanSummaryPanelProps {
  summary: ScanSummary;
}

const overallCopy = {
  CLEAN: {
    label: "CLEAN",
    variant: "clean" as const,
    description: "No flagged files were found.",
  },
  DETECTED: {
    label: "DETECTED",
    variant: "detected" as const,
    description: "Flagged client files were found.",
  },
  WARNING: {
    label: "WARNING",
    variant: "warning" as const,
    description: "The scan finished with warnings.",
  },
};

export function ScanSummaryPanel({
  summary,
}: ScanSummaryPanelProps): ReactElement {
  const overall = overallCopy[summary.overallStatus];

  return (
    <div className="space-y-3">
      <Card className="border-border">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Overall status
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{overall.description}</p>
          </div>
          <Badge variant={overall.variant}>{overall.label}</Badge>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Checks" value={summary.totalChecks} />
        <StatCard label="Flagged" value={summary.detected} tone="detected" />
        <StatCard label="Clean" value={summary.notDetected} tone="clean" />
        <StatCard label="Errors" value={summary.errors} tone="warning" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "detected" | "clean" | "warning";
}): ReactElement {
  const valueClass =
    tone === "detected"
      ? "text-destructive"
      : tone === "clean"
        ? "text-success"
        : tone === "warning"
          ? "text-warning"
          : "text-foreground";

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${valueClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
