"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      for (const s of shortcuts) {
        const metaMatch = s.metaKey ? e.metaKey : true;
        const ctrlMatch = s.ctrlKey ? e.ctrlKey : true;
        const shiftMatch = s.shiftKey ? e.shiftKey : true;
        if (e.key === s.key && metaMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          s.action();
          return;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}

export function useGlobalShortcuts(onAddEmployee?: () => void) {
  const router = useRouter();

  useKeyboardShortcuts([
    {
      key: "e",
      description: "Go to Employees",
      action: () => router.push("/employees"),
    },
    {
      key: "i",
      description: "Go to Insights",
      action: () => router.push("/insights"),
    },
    {
      key: "n",
      description: "New Employee",
      action: () => onAddEmployee?.(),
    },
  ]);
}
