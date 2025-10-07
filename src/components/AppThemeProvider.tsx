"use client";

import { useEffect } from "react";
import { StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";
import "alertifyjs/build/css/alertify.min.css";

let alertifyPromise: Promise<typeof import("alertifyjs")> | null = null;
function getAlertify() {
  if (!alertifyPromise) {
    alertifyPromise = import("alertifyjs").then(m => m.default ?? m);
  }
  return alertifyPromise;
}

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getAlertify().then((a) => {
      a.set("notifier", "position", "top-center");
      a.set("notifier", "delay", 4);
    });
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}