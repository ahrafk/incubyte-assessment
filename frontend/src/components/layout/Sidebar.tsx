"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-primary-foreground">SM</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground">SalaryMS</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-hidden p-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                active && "bg-sidebar-accent text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/50">Incubyte Assessment</p>
          <p className="text-xs text-sidebar-foreground/30">v0.1.0</p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={cn(
          "absolute -right-3 top-16 z-10 flex h-6 w-6 items-center justify-center",
          "rounded-full border bg-background shadow-sm transition-colors hover:bg-accent"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
