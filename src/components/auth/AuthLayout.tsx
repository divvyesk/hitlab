"use client";

import Link from "next/link";
import { WaveformBackground } from "@/components/landing/hero-effects";
import { HitLabLogo } from "@/components/layout/HitLabLogo";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-spotify-base">
      <WaveformBackground />

      <header className="relative z-10 flex h-14 shrink-0 items-center px-4 sm:h-16 sm:px-6 md:px-10">
        <Link href="/">
          <HitLabLogo size="sm" className="sm:hidden" />
          <HitLabLogo size="md" className="hidden sm:flex" />
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md py-4">
          <div className="mb-6 text-center sm:mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-spotify-subdued sm:mt-3 sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="rounded-xl bg-spotify-elevated-gradient p-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.04] sm:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
