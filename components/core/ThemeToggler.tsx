"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import {
  ThemeToggleButton,
  ThemeToggleButtonProps,
  useThemeTransition,
} from "@/components/ui/shadcn-io/theme-toggle-button";
import { cn } from "@/lib/utils";

interface ThemeTogglerProps {
  className?: ThemeToggleButtonProps["className"];
}

export function ThemeToggler({ className }: ThemeTogglerProps) {
  const { theme = "light", setTheme } = useTheme();
  const { startTransition } = useThemeTransition();

  const handleThemeToggle = useCallback(() => {
    startTransition(() => setTheme(theme === "light" ? "dark" : "light"));
  }, [theme, setTheme, startTransition]);

  return (
    <ThemeToggleButton
      theme={theme as ThemeToggleButtonProps["theme"]}
      onClick={handleThemeToggle}
      variant="circle"
      start="top-right"
      className={cn(
        "!bg-transparent hover:!bg-secondary/80 size-7 border-0 shadow-none",
        className,
      )}
    />
  );
}
