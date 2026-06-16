import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-12 w-full rounded-md border border-transparent bg-gradient-to-b from-spotify-card to-spotify-highlight px-4 text-sm text-white placeholder:text-spotify-muted transition-colors focus:border-spotify-green/50 focus:outline-none focus:ring-1 focus:ring-spotify-green/30 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
