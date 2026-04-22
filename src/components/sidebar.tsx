"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Search, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sokningar", label: "Sökningar", icon: Search },
  { href: "/medlemmar", label: "Medlemmar", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  const navVariants = prefersReduced
    ? { hidden: {}, show: {} }
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
      };

  const itemVariants = prefersReduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
      };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3.5 px-6 border-b border-sidebar-border">
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground text-sm font-black tracking-tight shrink-0"
          whileHover={prefersReduced ? {} : { scale: 1.08 }}
          whileTap={prefersReduced ? {} : { scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          B
        </motion.div>
        <div className="leading-none">
          <p className="text-sm font-semibold text-sidebar-foreground tracking-tight">BNI Enterprise</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">Sjuhärad</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3.5 py-5">
        <p className="px-2.5 mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Navigering
        </p>
        <motion.ul
          className="space-y-0.5"
          variants={navVariants}
          initial="hidden"
          animate="show"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <motion.li key={item.href} variants={itemVariants}>
                <Link href={item.href} className="block">
                  <motion.span
                    className={cn(
                      "flex items-center gap-3 rounded px-3 py-2.5 text-sm transition-colors duration-150 cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                    whileHover={prefersReduced ? {} : { x: 2 }}
                    whileTap={prefersReduced ? {} : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </motion.span>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-6 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[10px] text-muted-foreground">v1.0 · localStorage</p>
        </div>
      </div>
    </aside>
  );
}
