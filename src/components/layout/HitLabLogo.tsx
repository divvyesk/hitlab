import { cn } from "@/lib/utils";

interface HitLabLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 32, text: "text-base" },
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 44, text: "text-xl" },
};

export function HitLabLogo({
  size = "md",
  showText = true,
  className,
}: HitLabLogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative flex shrink-0 items-center justify-center rounded-full bg-spotify-icon-gradient shadow-[0_0_20px_rgba(29,185,84,0.35)]"
        style={{ width: icon, height: icon }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="text-black"
          style={{ width: icon * 0.55, height: icon * 0.55 }}
          aria-hidden
        >
          <rect x="3" y="10" width="2.5" height="10" rx="1.25" fill="currentColor" />
          <rect x="7" y="6" width="2.5" height="14" rx="1.25" fill="currentColor" />
          <rect x="11" y="8" width="2.5" height="12" rx="1.25" fill="currentColor" />
          <rect x="15" y="4" width="2.5" height="16" rx="1.25" fill="currentColor" />
          <rect x="19" y="9" width="2.5" height="11" rx="1.25" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-white", text)}>
          Hit<span className="text-spotify-green">Lab</span>{" "}
          <span className="font-semibold text-spotify-subdued">AI</span>
        </span>
      )}
    </div>
  );
}
