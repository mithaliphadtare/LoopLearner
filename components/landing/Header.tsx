"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

/** Minimal, distraction-free landing header. */
export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/70 bg-stone-50/85 backdrop-blur-md"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg">
          <Logo size="md" />
        </Link>
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-indigo-600 text-white 
                     rounded-xl text-sm font-medium hover:bg-indigo-700 
                     transition-all shadow-xs hover:shadow-sm active:scale-98"
        >
          <span>Start Learning</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </motion.header>
  );
}
