"use client";

import { usePathname } from "next/navigation";
import { CircleUserRound } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/employees": "Employees",
  "/insights": "Salary Insights",
};

export default function Header() {
  const pathname = usePathname();
  const title =
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))?.[1] ??
    "Dashboard";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CircleUserRound className="h-7 w-7" />
      </div>
    </header>
  );
}
