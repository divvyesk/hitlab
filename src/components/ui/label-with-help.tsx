import { Label } from "@/components/ui/label";
import { FeatureHelp } from "@/components/ui/feature-help";
import type { FeatureHelpKey } from "@/lib/feature-help";
import { cn } from "@/lib/utils";

interface LabelWithHelpProps {
  children: React.ReactNode;
  helpKey?: FeatureHelpKey;
  className?: string;
}

export function LabelWithHelp({
  children,
  helpKey,
  className,
}: LabelWithHelpProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Label>{children}</Label>
      {helpKey ? <FeatureHelp helpKey={helpKey} /> : null}
    </div>
  );
}
