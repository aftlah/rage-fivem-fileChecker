import type { ReactElement } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { scanRules } from "@/scanner/rules";
import { useSettings } from "@/hooks/useSettings";

export function SettingsPage(): ReactElement {
  const { settings, setRuleEnabled, setTheme, setAutoScan, setScanWhenFiveMStarts, resetSettings } =
    useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure scan rules and appearance. The scanner remains read-only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Configuration</CardTitle>
          <CardDescription>Enable or disable individual checks before scanning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{rule.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">{rule.relativePath}</p>
              </div>
              <Switch
                checked={settings.enabledRules[rule.id] !== false}
                onCheckedChange={(checked) => setRuleEnabled(rule.id, checked)}
                aria-label={`Toggle ${rule.name}`}
              />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={resetSettings}>
            <RotateCcw className="h-4 w-4" />
            Reset configuration
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Scan</CardTitle>
          <CardDescription>
            Detect the FiveM data folder and scan it without choosing files manually.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Scan automatically</p>
            <p className="text-sm text-muted-foreground">
              Run a scan when the app opens and after a folder is selected.
            </p>
          </div>
          <Switch
            checked={settings.autoScan}
            onCheckedChange={setAutoScan}
            aria-label="Toggle automatic scan"
          />
        </CardContent>
        <CardContent className="flex items-center justify-between border-t border-border">
          <div>
            <p className="text-sm font-medium">Scan when FiveM starts</p>
            <p className="text-sm text-muted-foreground">
            Keep this app open. When FiveM launches, the folder path switches to that FiveM
            installation and a scan runs automatically.
            </p>
          </div>
          <Switch
            checked={settings.scanWhenFiveMStarts}
            onCheckedChange={setScanWhenFiveMStarts}
            aria-label="Toggle scan when FiveM starts"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Dark mode is the default for this utility.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-sm text-muted-foreground">Use a dark interface.</p>
          </div>
          <Switch
            checked={settings.theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle dark mode"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Info label="Application" value="RAGE FiveM File Checker" />
          <Info label="Version" value="1.0.0" />
          <Info label="Developer" value="Aftlah" />
          <Info label="Mode" value="Read-only filesystem scanner" />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
