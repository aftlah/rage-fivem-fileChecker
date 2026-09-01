import type { ReactElement } from "react";
import { FolderSearch, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { truncatePath } from "@/lib/format";

interface PathSelectorProps {
  selectedPath: string;
  isBrowsing: boolean;
  isDetecting?: boolean;
  pathSource?: "auto" | "manual" | null;
  disabled?: boolean;
  onBrowse: () => void;
}

export function PathSelector({
  selectedPath,
  isBrowsing,
  isDetecting = false,
  pathSource,
  disabled = false,
  onBrowse,
}: PathSelectorProps): ReactElement {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-medium">FiveM Installation</p>
          {pathSource === "auto" && selectedPath ? (
            <Badge variant="info">Detected automatically</Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex min-h-11 min-w-0 flex-1 items-center rounded-lg border border-border bg-muted/40 px-3 py-2"
            title={selectedPath || undefined}
          >
            {isDetecting ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin text-info" />
            ) : (
              <FolderSearch className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate text-sm text-muted-foreground">
              {isDetecting
                ? "Detecting FiveM folder..."
                : selectedPath
                  ? truncatePath(selectedPath, 72)
                  : "No folder selected"}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onBrowse}
            disabled={disabled || isBrowsing}
          >
            {isBrowsing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Browse
          </Button>
        </div>
        {selectedPath ? (
          <p className="mt-3 break-all text-xs text-muted-foreground">{selectedPath}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
