"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function ChartContainer({ className, children }: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("h-56 min-w-0 w-full sm:h-64", className)}>
      {mounted ? children : null}
    </div>
  );
}
