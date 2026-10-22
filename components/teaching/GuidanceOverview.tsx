"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Target, Sparkles, BookOpen } from "lucide-react";

interface GuidanceOverviewProps {
  strongConcepts: string[];
  weakConcepts: string[];
  topic: string;
  onProceedToLesson: () => void;
}

export function GuidanceOverview({
  strongConcepts,
  weakConcepts,
  topic,
  onProceedToLesson,
}: GuidanceOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-2xl mx-auto flex flex-col gap-6"
    >
      {/* Friendly Header */}
      <div className="text-center">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5 block">
          Targeted Guidance &bull; {topic}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
          Let&apos;s work on what needs the most attention.
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          We&apos;ll use what you already understand to make the tricky parts click—no repetitive textbook lecturing.
        </p>
      </div>

      {/* Structured Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col gap-6">
        {/* Strong concepts block */}
        {strongConcepts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 size={14} strokeWidth={2.5} />
              </div>
              <h2 className="text-xs font-bold tracking-wider uppercase text-emerald-800">
                You&apos;ve already got a good handle on:
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {strongConcepts.map((concept) => (
                <span
                  key={concept}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold border border-emerald-200/60"
                >
                  ✓ {concept}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-100 w-full" />

        {/* Focus areas block */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
              <Target size={14} strokeWidth={2.5} />
            </div>
            <h2 className="text-xs font-bold tracking-wider uppercase text-indigo-900">
              Focus Area (Prioritized Learning Queue):
            </h2>
          </div>

          <div className="flex flex-col gap-2.5">
            {weakConcepts.map((concept, index) => (
              <div
                key={concept}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-semibold ${
                  index === 0
                    ? "bg-indigo-50/70 border-indigo-200 text-indigo-950 ring-2 ring-indigo-200/50"
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>{concept}</span>
                </div>
                {index === 0 ? (
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Current Focus
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-400">
                    Up Next
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={onProceedToLesson}
          className="mt-2 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white
                     rounded-xl text-base font-semibold hover:bg-indigo-700 
                     transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
        >
          <span>Begin Targeted Lesson</span>
          <ArrowRight size={17} />
        </button>
      </div>
    </motion.div>
  );
}
