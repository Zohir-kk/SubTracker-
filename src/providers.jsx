import { ThemeProvider } from "next-themes";

export function AppProviders({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="subdz-theme"
    >
      {children}
    </ThemeProvider>
  );
}
