import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HistoryProvider } from "./hooks/useHistory";
import { ScanProvider } from "./hooks/useScanContext";
import { SettingsProvider } from "./hooks/useSettings";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <HistoryProvider>
        <ScanProvider>
          <App />
        </ScanProvider>
      </HistoryProvider>
    </SettingsProvider>
  </React.StrictMode>,
);
