"use client";

import { StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/theme";

export default function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
