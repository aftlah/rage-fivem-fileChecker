import type { ReactElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { scanRules } from "@/scanner/rules";
import { useSettings } from "@/hooks/useSettings";

export function SettingsPage(): ReactElement {
  const { settings, setTheme, setOperatorName } = useSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only your character name and dark mode can be changed. All scan and automatic scan
          options are locked.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player & Discord</CardTitle>
          <CardDescription>
            Every scan is sent to Discord with this name. The webhook is already configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block cursor-text space-y-2">
            <span className="text-sm font-medium">name in character</span>
            <Input
              value={settings.operatorName}
              onChange={(event) => setOperatorName(event.target.value)}
              placeholder="name in character"
              maxLength={40}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Discord webhook URL</span>
            <Input value="Configured (locked)" readOnly disabled />
            <span className="text-xs text-muted-foreground">
              The webhook is set by the app and cannot be changed.
            </span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan Configuration</CardTitle>
          <CardDescription>
            These checks always run and cannot be turned off.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-lg border border-border px-4 py-3"
            >
              <p className="text-sm font-medium">{rule.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {rule.relativePath === "." ? "Entire FiveM folder" : rule.relativePath}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Scan</CardTitle>
          <CardDescription>
            Automatic scan behavior is always enabled and cannot be changed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Scan automatically</p>
            <p className="text-sm text-muted-foreground">
              Run a scan when the app opens and after a folder is selected.
            </p>
          </div>
          <LockedSwitch checked aria-label="Scan automatically locked on" />
        </CardContent>
        <CardContent className="flex items-center justify-between border-t border-border">
          <div>
            <p className="text-sm font-medium">Scan when FiveM starts</p>
            <p className="text-sm text-muted-foreground">
              When FiveM launches, the folder path switches to that FiveM installation and a scan
              runs automatically.
            </p>
          </div>
          <LockedSwitch checked aria-label="Scan when FiveM starts locked on" />
        </CardContent>
        <CardContent className="flex items-center justify-between border-t border-border">
          <div>
            <p className="text-sm font-medium">Open when FiveM starts</p>
            <p className="text-sm text-muted-foreground">
              Starts this app in the background with Windows. When FiveM opens, the scanner window
              appears and a scan can run.
            </p>
          </div>
          <LockedSwitch checked aria-label="Open when FiveM starts locked on" />
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
          <Info label="Application" value="RAGE File Scanner" />
          <Info label="Version" value="1.0.0" />
          <Info label="Developer" value="Aftlah" />
          <Info label="Mode" value="Read-only filesystem scanner" />
        </CardContent>
      </Card>
    </div>
  );
}

function LockedSwitch({
  checked,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  "aria-label": string;
}): ReactElement {
  return (
    <Switch
      checked={checked}
      disabled
      aria-label={ariaLabel}
      className="opacity-70"
    />
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
