"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "mb-8 max-w-3xl sm:mb-12",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-spotify-gradient">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-relaxed text-spotify-subdued sm:mt-4 sm:text-lg md:text-xl">
          {description}
        </p>
      )}
    </motion.div>
  );
}
