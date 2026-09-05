import { useState, type ReactElement } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAutoUpdater } from "@/hooks/useAutoUpdater";
import { useHistory } from "@/hooks/useHistory";
import { useSettings } from "@/hooks/useSettings";
import { DashboardPage } from "@/pages/DashboardPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { NameGate } from "@/pages/NameGate";
import { SettingsPage } from "@/pages/SettingsPage";
import type { AppView } from "@/scanner/types";

export default function App(): ReactElement {
  const [view, setView] = useState<AppView>("dashboard");
  const history = useHistory();
  const { settings } = useSettings();
  useAutoUpdater(true);

  if (!settings.operatorName.trim()) {
    return <NameGate />;
  }

  return (
    <AppLayout view={view} onNavigate={setView}>
      {view === "dashboard" ? <DashboardPage /> : null}
      {view === "history" ? (
        <HistoryPage entries={history.entries} onClear={history.clearHistory} />
      ) : null}
      {view === "settings" ? <SettingsPage /> : null}
    </AppLayout>
  );
}
