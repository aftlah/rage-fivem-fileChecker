import type { ReactElement } from "react";
import { Loader2, Play } from "lucide-react";
import { PathSelector } from "@/components/dashboard/PathSelector";
import { ResultCard } from "@/components/dashboard/ResultCard";
import { ScanProgressPanel } from "@/components/dashboard/ScanProgressPanel";
import { ScanSummaryPanel } from "@/components/dashboard/ScanSummaryPanel";
import { ValidationWarning } from "@/components/dashboard/ValidationWarning";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useScanContext } from "@/hooks/useScanContext";

export function DashboardPage(): ReactElement {
  const scan = useScanContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">RAGE FiveM File Checker</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep this app open. When FiveM starts, a scan runs automatically.
        </p>
      </div>

      <PathSelector
        selectedPath={scan.selectedPath}
        isBrowsing={scan.isBrowsing}
        isDetecting={scan.isDetecting}
        pathSource={scan.pathSource}
        disabled={scan.isScanning || scan.isDetecting}
        onBrowse={() => void scan.browse()}
      />

      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {scan.fiveMRunning
              ? "FiveM is running. The path was updated to this FiveM installation."
              : "Watching for FiveM. Opening FiveM will set the path automatically."}
          </p>
          <Badge variant={scan.fiveMRunning ? "info" : "outline"}>
            {scan.fiveMRunning ? "FiveM running" : "Waiting for FiveM"}
          </Badge>
        </div>
      </div>

      {scan.validation && !scan.validation.isValid ? (
        <ValidationWarning
          validation={scan.validation}
          onChooseAnother={() => void scan.browse()}
          onUseSuggested={(path) => void scan.applyPath(path, "auto")}
        />
      ) : null}

      {scan.error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {scan.error}
        </div>
      ) : null}

      <div className="flex justify-center">
        <Button
          type="button"
          size="lg"
          onClick={() => void scan.startScan()}
          disabled={scan.isScanning || scan.isDetecting || !scan.selectedPath}
        >
          {scan.isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {scan.hasScanned ? "Scan Again" : "Start Scan"}
        </Button>
      </div>

      {scan.isScanning && scan.progress ? (
        <ScanProgressPanel progress={scan.progress} />
      ) : null}

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Scan Result</h2>
          <p className="text-sm text-muted-foreground">
            {scan.hasScanned && scan.summary
              ? `Scan completed. ${scan.summary.detected} issue${scan.summary.detected === 1 ? "" : "s"} detected.`
              : scan.isDetecting
                ? "Looking for a FiveM installation..."
                : "Waiting for an automatic scan, or press Start Scan."}
          </p>
        </div>

        {scan.hasScanned && scan.summary ? <ScanSummaryPanel summary={scan.summary} /> : null}

        {scan.hasScanned && scan.results.length > 0 ? (
          <div className="grid gap-4">
            {scan.results.map((result) => (
              <ResultCard key={result.ruleId} result={result} />
            ))}
          </div>
        ) : null}

        {!scan.hasScanned && !scan.isScanning && !scan.isDetecting ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {scan.selectedPath
                ? "Press Start Scan if automatic scanning is turned off."
                : "FiveM was not found automatically. Use Browse to select FiveM Application Data or FiveM.app."}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
