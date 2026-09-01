import { useState, type ReactElement } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHistory } from "@/hooks/useHistory";
import { DashboardPage } from "@/pages/DashboardPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import type { AppView } from "@/scanner/types";

export default function App(): ReactElement {
  const [view, setView] = useState<AppView>("dashboard");
  const history = useHistory();

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
