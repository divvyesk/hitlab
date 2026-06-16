"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HitLabLogo } from "@/components/layout/HitLabLogo";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 md:px-6"
    >
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between gap-2 rounded-full border border-white/10 bg-gradient-to-b from-[#252525]/95 to-[#181818]/95 px-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:h-14 sm:px-4 md:px-6">
        <Link href="/" className="min-w-0 shrink">
          <HitLabLogo size="sm" />
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link href="/login">
            <Button size="sm" variant="ghost" className="h-9 px-3 sm:h-10 sm:px-5">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="h-9 px-3 sm:h-10 sm:px-5">
              <span className="hidden sm:inline">Get Started</span>
              <span className="sm:hidden">Start</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
