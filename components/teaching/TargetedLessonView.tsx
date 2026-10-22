"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import type { ClientTargetedTeaching } from "@/lib/schemas/teaching";

interface TargetedLessonViewProps {
  lesson: ClientTargetedTeaching;
  teachingSessionId: string;
  conceptIndex: number;
  totalConcepts: number;
  onLessonMastered: (concept: string) => void;
  onRequestSimplerExplanation: (previousQuestion: string, studentAnswer: string) => void;
}

export function TargetedLessonView({
  lesson,
  teachingSessionId,
  conceptIndex,
  totalConcepts,
  onLessonMastered,
  onRequestSimplerExplanation,
}: TargetedLessonViewProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    isCorrect: boolean;
    correctAnswer: number;
    explanation: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const optionPrefixes = ["A", "B", "C", "D"];
  const isAnswered = evaluation !== null;

  const handleSelectOption = (idx: number) => {
    if (isAnswered || isSubmitting) return;
    setSelectedOption(idx);
    setErrorMessage(null);
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null || isAnswered || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/teaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_answer",
          teachingSessionId,
          selectedOption,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify check answer");
      }

      setEvaluation({
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      });
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Error checking answer";
      setErrorMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueOrRetry = () => {
    if (!evaluation || selectedOption === null) return;

    if (evaluation.isCorrect) {
      onLessonMastered(lesson.concept);
    } else {
      const studentAnsText = lesson.checkQuestion.options[selectedOption];
      onRequestSimplerExplanation(lesson.checkQuestion.question, studentAnsText);
    }
  };

  return (
    <motion.div
      key={lesson.concept}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto flex flex-col gap-6 pb-12"
    >
      {/* Top concept header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Concept {conceptIndex + 1} of {totalConcepts} &bull; Targeted Guidance
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Let&apos;s strengthen: {lesson.concept}
          </h1>
        </div>
      </div>

      {/* Main explanation card with structured pedagogical cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-xs flex flex-col gap-7">
        {/* Section 1: What you already know */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 size={17} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
              What You Already Understand
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {lesson.whatYouAlreadyKnow}
            </p>
          </div>
        </div>

        {/* Section 2: The Gap / Misconception */}
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb size={17} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
              The Gap
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              {lesson.theGap}
            </p>
          </div>
        </div>

        {/* Section 3: Let's Make It Click (Core Intuition) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Sparkles size={13} className="text-indigo-600" />
            <span>Let&apos;s Make It Click</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal mb-4">
            {lesson.explanation}
          </p>

          {lesson.formula && (
            <div className="my-3 p-4 rounded-xl bg-stone-50 border border-slate-200/80 font-mono text-center text-lg sm:text-xl font-bold text-indigo-700 shadow-xs">
              {lesson.formula}
            </div>
          )}
        </div>

        {/* Section 4: Try This Example */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-slate-200/80">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <BookOpen size={13} className="text-slate-600" />
            <span>Try This Example</span>
          </h2>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-mono bg-white p-3.5 rounded-xl border border-slate-200/60 whitespace-pre-line">
            {lesson.example}
          </div>
        </div>

        {/* Section 5: Key Takeaway */}
        <div className="p-4 rounded-xl bg-indigo-600 text-white flex items-center gap-3 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
          <div className="text-xs sm:text-sm font-semibold leading-snug">
            <span className="opacity-80 font-normal mr-1.5 uppercase text-[11px] tracking-wider block sm:inline">
              Key Takeaway:
            </span>
            {lesson.keyTakeaway}
          </div>
        </div>
      </div>

      {/* Interactive Quick Check Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700">
            <HelpCircle size={16} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Check
            </h2>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Check your understanding
            </h3>
          </div>
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
          {lesson.checkQuestion.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {lesson.checkQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = evaluation?.correctAnswer === idx;
            const isWrongSelection = isAnswered && isSelected && !evaluation?.isCorrect;

            let optStyle = "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700";
            let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";

            if (isAnswered) {
              if (isCorrect) {
                optStyle = "border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-200";
                badgeStyle = "bg-emerald-600 text-white border-emerald-600";
              } else if (isWrongSelection) {
                optStyle = "border-rose-400 bg-rose-50/60 text-rose-950";
                badgeStyle = "bg-rose-500 text-white border-rose-500";
              } else {
                optStyle = "border-slate-200/50 bg-slate-50/40 text-slate-400 opacity-60";
                badgeStyle = "bg-slate-100 text-slate-400 border-slate-200/60";
              }
            } else if (isSelected) {
              optStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-200 shadow-xs";
              badgeStyle = "bg-indigo-600 text-white border-indigo-600";
            }

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered || isSubmitting}
                className={`w-full flex items-start text-left gap-3.5 p-3.5 sm:p-4 rounded-xl border-2 transition-all ${optStyle} ${
                  !isAnswered ? "cursor-pointer active:scale-99" : "cursor-default"
                }`}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border ${badgeStyle}`}
                >
                  {optionPrefixes[idx]}
                </span>
                <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                  {opt}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback block */}
        <AnimatePresence>
          {evaluation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className={`p-4 rounded-2xl border ${
                  evaluation.isCorrect
                    ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-950"
                    : "bg-amber-50/80 border-amber-200/80 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
                  {evaluation.isCorrect ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span className="text-emerald-700">Nice — that misconception looks cleared up!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-amber-600" />
                      <span className="text-amber-700">Not quite yet. Let&apos;s look at this another way.</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                  {evaluation.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div>
          {!isAnswered ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={selectedOption === null || isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white
                         rounded-xl text-base font-semibold hover:bg-indigo-700 
                         transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Checking..." : "Verify Understanding"}</span>
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinueOrRetry}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-white
                         rounded-xl text-base font-semibold transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98 ${
                           evaluation?.isCorrect
                             ? "bg-emerald-600 hover:bg-emerald-700"
                             : "bg-indigo-600 hover:bg-indigo-700"
                         }`}
            >
              {evaluation?.isCorrect ? (
                <>
                  <span>Concept Mastered &bull; Continue</span>
                  <ArrowRight size={17} />
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  <span>See Simpler Analogy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
