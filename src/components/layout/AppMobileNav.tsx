"use client";

import { BarChart3, FlaskConical, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Studio", id: "studio", icon: Music2 },
  { label: "What-If", id: "what-if", icon: FlaskConical },
  { label: "Analytics", id: "analytics", icon: BarChart3 },
];

export function AppMobileNav() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#181818]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollTo(tab.id)}
            className={cn(
              "flex min-w-[72px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-spotify-subdued transition-colors active:text-spotify-green"
            )}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
