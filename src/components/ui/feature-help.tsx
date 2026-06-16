"use client";

import * as Popover from "@radix-ui/react-popover";
import { Info } from "lucide-react";
import { FEATURE_HELP, type FeatureHelpKey } from "@/lib/feature-help";
import { cn } from "@/lib/utils";

interface FeatureHelpProps {
  helpKey: FeatureHelpKey;
  className?: string;
}

export function FeatureHelp({ helpKey, className }: FeatureHelpProps) {
  const { title, description } = FEATURE_HELP[helpKey];

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Learn more about ${title}`}
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-spotify-muted transition-colors hover:bg-white/10 hover:text-spotify-green focus:outline-none focus-visible:ring-1 focus-visible:ring-spotify-green/40",
            className
          )}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={8}
          className="z-50 max-h-72 w-72 overflow-y-auto rounded-lg border border-white/10 bg-spotify-elevated-gradient p-4 text-left shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-spotify-subdued">
            {description}
          </p>
          <Popover.Arrow className="fill-spotify-elevated" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
