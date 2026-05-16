"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-16 flex-col items-center border-r bg-sidebar py-4 md:w-56 md:items-start md:px-4">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">SM</span>
        </div>
        <span className="hidden text-sm font-semibold text-sidebar-foreground md:block">
          SalaryMS
        </span>
      </div>

      <nav className="flex w-full flex-1 flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              pathname.startsWith(href) &&
                "bg-sidebar-accent text-sidebar-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden md:block">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="hidden w-full border-t border-sidebar-border pt-4 md:block">
        <p className="px-2 text-xs text-sidebar-foreground/50">
          Incubyte Assessment
        </p>
        <p className="px-2 text-xs text-sidebar-foreground/30">v0.1.0</p>
      </div>
    </aside>
  );
}
