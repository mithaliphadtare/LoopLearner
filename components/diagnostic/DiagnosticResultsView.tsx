"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, AlertTriangle, RotateCcw, Target } from "lucide-react";
import type { DiagnosticAssessmentResult } from "@/lib/schemas/diagnostic";

interface DiagnosticResultsViewProps {
  result: DiagnosticAssessmentResult;
  topic: string;
  onReset: () => void;
  onStartLearning: () => void;
}

export function DiagnosticResultsView({
  result,
  topic,
  onReset,
  onStartLearning,
}: DiagnosticResultsViewProps) {
  const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-12"
    >
      {/* Header Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-xs text-center flex flex-col items-center">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">
          Diagnostic Complete &bull; {topic}
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
          Here&apos;s what we found.
        </h1>

        <p className="text-slate-600 text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed">
          {result.weakConcepts.length > 0
            ? "LearnLoop found a couple of concepts worth focusing on so you can achieve true mastery."
            : "Strong conceptual foundation across the board! You're ready to advance deeper."}
        </p>

        {/* Score Badge */}
        <div className="flex items-center gap-5 p-4 sm:p-5 rounded-2xl bg-stone-50 border border-slate-200/60 max-w-sm w-full justify-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {result.correctAnswers} <span className="text-xl font-normal text-slate-400">/ {result.totalQuestions}</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Questions Correct</span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600">
              {percentage}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Demonstrated Understanding</span>
          </div>
        </div>
      </div>

      {/* Concept Breakdown Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              Knowledge Map
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Concept-Level Performance
            </h2>
          </div>
          <Target size={18} className="text-slate-400" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {result.conceptPerformance.map((item, index) => {
            const isStrong = item.status === "Strong";

            return (
              <motion.div
                key={item.concept}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                className={`
                  flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors
                  ${isStrong
                    ? "bg-stone-50/70 border-slate-100 hover:border-emerald-200"
                    : "bg-amber-50/40 border-amber-200/60 hover:border-amber-300"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isStrong
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {isStrong ? (
                      <CheckCircle2 size={16} strokeWidth={2.5} />
                    ) : (
                      <AlertTriangle size={16} strokeWidth={2.5} />
                    )}
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-slate-900">
                    {item.concept}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      isStrong
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                        : "bg-amber-50 text-amber-700 border-amber-200/70"
                    }`}
                  >
                    {isStrong ? "Strong" : "Needs practice"}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Primary Action / Transition to Adaptive Teaching */}
      <div className="bg-gradient-to-b from-white to-stone-50 rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-xs text-center flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2">
          {result.weakConcepts.length > 0
            ? "Ready for targeted guidance?"
            : "Ready for advanced mastery?"}
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-7 leading-relaxed">
          {result.weakConcepts.length > 0
            ? `Next, we'll teach ${result.weakConcepts.slice(0, 2).join(" and ")} based on what you already know.`
            : "Next, we'll guide you through adaptive mastery practice tailored to your pace."}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onStartLearning}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white
                       rounded-xl text-base font-semibold hover:bg-indigo-700 
                       transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
          >
            <span>Start Learning</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer transition-colors"
          >
            <RotateCcw size={13} />
            <span>Study different material</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
