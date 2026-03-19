import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "destructive" | "ghost";
}

export const TerminalButton = React.forwardRef<HTMLButtonElement, TerminalButtonProps>(
  ({ className, isLoading, children, variant = "primary", disabled, ...props }, ref) => {
    const baseStyles = "relative px-6 py-3 uppercase tracking-widest font-bold transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden group";
    
    const variants = {
      primary: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(204,85,0,0.5)] disabled:hover:bg-transparent disabled:hover:text-primary",
      destructive: "border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] disabled:hover:bg-transparent disabled:hover:text-destructive",
      ghost: "text-muted-foreground hover:text-primary hover:bg-primary/10"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          (disabled || isLoading) && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {/* Subtle scanline effect on hover */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

TerminalButton.displayName = "TerminalButton";
