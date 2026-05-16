"use client";

import { usePathname } from "next/navigation";
import { CircleUserRound, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

const pageTitles: Record<string, string> = {
  "/employees": "Employees",
  "/insights": "Salary Insights",
};

export default function Header() {
  const pathname = usePathname();
  const { toggle } = useSidebar();
  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
    "Dashboard";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label="Toggle sidebar"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md",
            "text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            "md:hidden"
          )}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CircleUserRound className="h-7 w-7" />
      </div>
    </header>
  );
}
