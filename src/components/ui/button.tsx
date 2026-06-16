import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-spotify-green-gradient text-black shadow-[0_4px_20px_rgba(29,185,84,0.25)] hover:scale-[1.04] hover:shadow-[0_6px_28px_rgba(29,185,84,0.35)] active:scale-[0.98]",
        secondary:
          "border border-white/20 bg-gradient-to-b from-white/10 to-white/5 text-white hover:border-white/40 hover:from-white/15 hover:to-white/8 hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-spotify-subdued hover:text-white hover:bg-white/10",
      },
      size: {
        default: "h-11 px-6 sm:h-12 sm:px-8",
        sm: "h-9 px-4 text-xs sm:h-10 sm:px-5",
        lg: "h-12 px-6 text-sm sm:h-14 sm:px-10 sm:text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
