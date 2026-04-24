"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";

interface TopbarProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}

export function Topbar({ title, subtitle, onAdd, addLabel = "Lägg till sökning", children }: TopbarProps) {
  const prefersReduced = useReducedMotion();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/50 px-4 md:px-6 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <>
            <span className="text-border">·</span>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onAdd && (
          <motion.div
            initial={prefersReduced ? {} : { opacity: 0, scale: 0.88, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.05 }}
          >
            <motion.div
              whileHover={prefersReduced ? {} : { scale: 1.04 }}
              whileTap={prefersReduced ? {} : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Button onClick={onAdd} size="sm" className="h-8 text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                {addLabel}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
