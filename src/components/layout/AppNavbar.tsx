"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { HitLabLogo } from "@/components/layout/HitLabLogo";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
}

export function AppNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 md:px-6"
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 rounded-full border border-white/10 bg-gradient-to-b from-[#252525]/95 to-[#181818]/95 px-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:h-14 sm:px-4 md:px-6">
        <Link href="/app" className="min-w-0 shrink">
          <HitLabLogo size="sm" showText={false} className="sm:hidden" />
          <HitLabLogo size="sm" className="hidden sm:flex" />
        </Link>

        <nav className="hidden items-center gap-4 lg:gap-6 md:flex">
          {[
            { label: "Studio", id: "studio" },
            { label: "What-If", id: "what-if" },
            { label: "Analytics", id: "analytics" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-spotify-subdued transition-colors hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user && (
            <span className="hidden max-w-[100px] truncate text-sm text-spotify-subdued lg:inline xl:max-w-none">
              {user.name}
            </span>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={handleLogout}
            className="h-9 px-3 sm:h-10 sm:px-5"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
