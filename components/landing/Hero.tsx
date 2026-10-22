"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

/** Focused hero communicating the core proposition within seconds. */
export function Hero() {
  return (
    <section className="pt-32 pb-12 px-6 md:pt-40 md:pb-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Supporting tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 mb-6 rounded-full 
                     bg-indigo-50 text-indigo-700 text-xs sm:text-sm font-medium border border-indigo-100"
        >
          <Sparkles size={14} className="text-indigo-600" />
          <span>Built for students</span>
        </motion.div>

        {/* Hero headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.08] mb-6"
        >
          Learn smarter.
          <br />
          <span className="text-indigo-600">Master</span> what you study.
        </motion.h1>

        {/* Supporting statement */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
          className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-9 leading-relaxed"
        >
          Upload a page, diagram, or handwritten note.
          <br className="hidden sm:inline" />{" "}
          LearnLoop turns it into an interactive learning session.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/learn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white
                       rounded-xl text-base font-semibold hover:bg-indigo-700 
                       transition-all shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/25
                       hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Start Learning</span>
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
