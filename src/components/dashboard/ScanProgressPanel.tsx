import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ScanProgressEvent } from "@/scanner/types";

interface ScanProgressPanelProps {
  progress: ScanProgressEvent;
}

export function ScanProgressPanel({
  progress,
}: ScanProgressPanelProps): ReactElement {
  const percent = progress.total === 0 ? 0 : (progress.current / progress.total) * 100;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-info" />
          <p className="text-sm font-medium">Scanning...</p>
        </div>
        <Progress value={percent} />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Checking: <span className="text-foreground">{progress.ruleName}</span>
          </p>
          <p>
            {Math.min(progress.current, progress.total)} / {progress.total} checks completed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
