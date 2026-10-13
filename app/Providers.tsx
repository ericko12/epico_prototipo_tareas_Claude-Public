"use client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { muiTheme } from "@/config/theme/muiTheme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
