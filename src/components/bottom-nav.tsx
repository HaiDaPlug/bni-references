"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/sokningar", label: "Sökningar", icon: Search },
  { href: "/medlemmar", label: "Medlemmar", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden border-t border-sidebar-border bg-sidebar">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <span className={cn(
              "flex flex-col items-center justify-center gap-1 py-3 text-[10px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
