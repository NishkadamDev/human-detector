import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TerminalPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function TerminalPanel({ title, icon, children, className, ...props }: TerminalPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative bg-card/40 border border-border glow-box flex flex-col backdrop-blur-md",
        className
      )}
      {...props}
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />

      {/* Header Bar */}
      <div className="bg-border/50 border-b border-border px-4 py-2 flex items-center gap-3">
        {icon && <span className="text-primary">{icon}</span>}
        <h2 className="text-primary font-bold tracking-widest uppercase text-sm glow-text">{title}</h2>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
}
