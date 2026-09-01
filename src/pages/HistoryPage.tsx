import type { ReactElement } from "react";
import { History, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatScanDate, truncatePath } from "@/lib/format";
import type { ScanHistoryEntry } from "@/scanner/types";

interface HistoryPageProps {
  entries: ScanHistoryEntry[];
  onClear: () => void;
}

export function HistoryPage({
  entries,
  onClear,
}: HistoryPageProps): ReactElement {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scan History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent scans stored locally on this computer.
          </p>
        </div>
        {entries.length > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4" />
            Clear history
          </Button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <History className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No scans yet. Completed scans will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{formatScanDate(entry.scannedAt)}</p>
                  <p className="mt-1 truncate text-sm text-muted-foreground" title={entry.fiveMPath}>
                    {truncatePath(entry.fiveMPath, 80)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    {entry.detected} detected
                  </p>
                  <Badge
                    variant={
                      entry.overallStatus === "DETECTED"
                        ? "detected"
                        : entry.overallStatus === "WARNING"
                          ? "warning"
                          : "clean"
                    }
                  >
                    {entry.overallStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
