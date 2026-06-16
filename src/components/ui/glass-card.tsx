import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function GlassCard({
  className,
  glow = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] bg-spotify-elevated-gradient p-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)] sm:p-6",
        glow &&
          "shadow-[0_0_40px_rgba(29,185,84,0.1),0_8px_24px_rgba(0,0,0,0.5)] ring-1 ring-spotify-green/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
