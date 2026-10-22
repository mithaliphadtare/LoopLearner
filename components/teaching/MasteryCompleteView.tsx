"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Trophy, RotateCcw, Sparkles } from "lucide-react";

interface MasteryCompleteViewProps {
  topic: string;
  masteredConcepts: string[];
  totalWeakConcepts: number;
  onReset: () => void;
}

export function MasteryCompleteView({
  topic,
  masteredConcepts,
  totalWeakConcepts,
  onReset,
}: MasteryCompleteViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto flex flex-col items-center text-center gap-6 pb-12"
    >
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xs w-full flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5 shadow-xs">
          <Trophy size={32} strokeWidth={2.25} />
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 mb-3">
          Session Mastery Achieved
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
          You didn&apos;t just get answers. You mastered it.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
          Through your diagnostic check and targeted adaptive explanations, your conceptual misunderstandings in &ldquo;{topic}&rdquo; have been resolved.
        </p>

        {/* Mastered concepts pill list */}
        <div className="w-full bg-stone-50 rounded-2xl p-5 border border-slate-100 mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-left">
            Concepts Mastered This Session:
          </h2>
          <div className="flex flex-wrap gap-2">
            {masteredConcepts.map((concept) => (
              <span
                key={concept}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-emerald-900 text-xs sm:text-sm font-semibold border border-emerald-200/80 shadow-xs"
              >
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>{concept}</span>
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white
                     rounded-xl text-base font-semibold hover:bg-indigo-700 
                     transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
        >
          <RotateCcw size={16} />
          <span>Study New Material</span>
        </button>
      </div>
    </motion.div>
  );
}
