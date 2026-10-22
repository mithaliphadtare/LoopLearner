"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Layers, Tag, RotateCcw } from "lucide-react";
import type { AnalysisResult } from "@/lib/schemas/analysis";

interface AnalysisResultViewProps {
  analysis: AnalysisResult;
  onReset: () => void;
  onStartDiagnostic?: () => void;
  diagnosticAvailable?: boolean;
}

const difficultyBadgeColors: Record<
  AnalysisResult["difficulty"],
  { bg: string; text: string; border: string }
> = {
  Beginner: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200/80",
  },
  Intermediate: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200/80",
  },
  Advanced: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/80",
  },
};

export function AnalysisResultView({
  analysis,
  onReset,
  onStartDiagnostic,
  diagnosticAvailable = true,
}: AnalysisResultViewProps) {
  const badge = difficultyBadgeColors[analysis.difficulty] || difficultyBadgeColors.Intermediate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl mx-auto flex flex-col gap-8 pb-12"
    >
      {/* Header Card: Topic, Description & Difficulty */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Identified Topic
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {analysis.difficulty}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          {analysis.topic}
        </h1>

        <div className="border-t border-slate-100 pt-4 mt-2">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
            <BookOpen size={13} className="text-indigo-600" />
            <span>What&apos;s this about?</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {analysis.description}
          </p>
        </div>
      </div>

      {/* Key Concepts Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              Curriculum Breakdown
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Here&apos;s what you&apos;ll be learning
            </h2>
          </div>
          <Layers size={18} className="text-slate-400" />
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {analysis.keyConcepts.map((concept, index) => {
            const formattedIndex = String(index + 1).padStart(2, "0");
            return (
              <motion.div
                key={concept}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center gap-4 p-3.5 sm:p-4 rounded-xl bg-stone-50/80 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-colors"
              >
                <span className="text-xs font-bold text-indigo-600 font-mono tracking-wider w-6">
                  {formattedIndex}
                </span>
                <span className="text-sm sm:text-base font-semibold text-slate-900">
                  {concept}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Important Terms Pills */}
        {analysis.importantTerms && analysis.importantTerms.length > 0 && (
          <div className="mt-7 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3">
              <Tag size={13} className="text-slate-400" />
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                Important Terms
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.importantTerms.map((term) => (
                <span
                  key={term}
                  className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/60"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Step / Diagnostic Call to Action */}
      <div className="bg-gradient-to-b from-white to-stone-50 rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs text-center flex flex-col items-center">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2">
          Ready to see what you already know?
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          LearnLoop will use a few questions to understand where you need the most help.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onStartDiagnostic}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white
                       rounded-xl text-base font-semibold hover:bg-indigo-700 
                       transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98"
          >
            <span>Start Diagnostic</span>
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
