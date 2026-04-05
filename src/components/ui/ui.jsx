import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  isDark = theme === "dark";
  rerturn(
    <div className="flex items-center gap-2.5">
      <Sun
        className="h-3.5 w-3.5 transition-opacity"
        style={{ opacity: isDark ? 0.3 : 1, color: "var(--gold)" }}
      />
      <Switch
        checked={isDark}
        onCheckedChange={(val) => setTheme(val ? "dark" : "light")}
        className="data-[state=checked]:bg-gold] data-[state-unchecked]:bg-border-2"
      />
      <Moon
        className="h-3.5 w-3.5 transition-opacity"
        style={{ opacity: isDark ? 1 : 0.3, color: "var(--gold)" }}
      />
    </div>,
  );
}
