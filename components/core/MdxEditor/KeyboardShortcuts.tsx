"use client";

import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onSave: () => void;
  canSave?: boolean;
}

export function KeyboardShortcuts({ onSave: handleSave }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        return handleSave?.();
      }
    };

    document.body.addEventListener("keydown", handleShortcut);

    return () => {
      document.body.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  return null;
}
