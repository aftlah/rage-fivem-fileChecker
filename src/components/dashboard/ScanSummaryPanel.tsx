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
    description: "No high-severity items were detected.",
  },
  DETECTED: {
    label: "DETECTED",
    variant: "detected" as const,
    description: "At least one high-severity item was found.",
  },
  WARNING: {
    label: "WARNING",
    variant: "warning" as const,
    description: "The scan finished with warnings or non-critical detections.",
  },
};

export function ScanSummaryPanel({
  summary,
}: ScanSummaryPanelProps): ReactElement {
  const overall = overallCopy[summary.overallStatus];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <StatCard label="Total Checks" value={summary.totalChecks} />
      <StatCard label="Detected" value={summary.detected} tone="detected" />
      <StatCard label="Not Detected" value={summary.notDetected} tone="clean" />
      <StatCard label="Errors" value={summary.errors} tone="warning" />
      <Card>
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Overall Status
          </p>
          <div className="mt-3">
            <Badge variant={overall.variant}>{overall.label}</Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{overall.description}</p>
        </CardContent>
      </Card>
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
      <CardContent className="p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
