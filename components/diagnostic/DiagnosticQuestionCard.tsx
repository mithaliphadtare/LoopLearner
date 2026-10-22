"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle, Sparkles, AlertCircle } from "lucide-react";
import type { ClientDiagnosticQuestion } from "@/lib/schemas/diagnostic";

interface DiagnosticQuestionCardProps {
  question: ClientDiagnosticQuestion;
  currentIndex: number;
  totalQuestions: number;
  sessionId: string;
  onNextQuestion: (questionId: string, selectedOption: number, isCorrect: boolean) => void;
}

interface EvaluationState {
  isCorrect: boolean;
  correctAnswer: number;
  explanation: string;
}

const optionPrefixes = ["A", "B", "C", "D"];

export function DiagnosticQuestionCard({
  question,
  currentIndex,
  totalQuestions,
  sessionId,
  onNextQuestion,
}: DiagnosticQuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAnswered = evaluation !== null;

  const handleSelectOption = (index: number) => {
    if (isAnswered || isSubmitting) return;
    setSelectedOption(index);
    setErrorMessage(null);
  };

  const handleCheckAnswer = async () => {
    if (selectedOption === null || isAnswered || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "check_question",
          sessionId,
          questionId: question.id,
          selectedOption,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to check answer");
      }

      setEvaluation({
        isCorrect: data.isCorrect,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      });
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to verify answer";
      setErrorMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceed = () => {
    if (!evaluation || selectedOption === null) return;
    onNextQuestion(question.id, selectedOption, evaluation.isCorrect);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Friendly Banner */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1.5">
          Let&apos;s see what you already know.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          This isn&apos;t a test. It helps LearnLoop understand where you need the most help.
        </p>
      </div>

      {/* Main Diagnostic Card */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-9 shadow-xs flex flex-col"
      >
        {/* Progress & Concept Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/70">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {question.concept}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100 rounded-full mb-7 overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Text */}
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-8">
          {question.question}
        </h3>

        {/* Options List */}
        <div className="flex flex-col gap-3 mb-6">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrectOption = evaluation?.correctAnswer === index;
            const isWrongSelection = isAnswered && isSelected && !evaluation?.isCorrect;

            let optionStyle = "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700";
            let badgeStyle = "bg-slate-100 text-slate-600 border-slate-200";

            if (isAnswered) {
              if (isCorrectOption) {
                optionStyle = "border-emerald-500 bg-emerald-50/60 text-emerald-950 ring-2 ring-emerald-200";
                badgeStyle = "bg-emerald-600 text-white border-emerald-600";
              } else if (isWrongSelection) {
                optionStyle = "border-rose-400 bg-rose-50/60 text-rose-950";
                badgeStyle = "bg-rose-500 text-white border-rose-500";
              } else {
                optionStyle = "border-slate-200/50 bg-slate-50/40 text-slate-400 opacity-60";
                badgeStyle = "bg-slate-100 text-slate-400 border-slate-200/60";
              }
            } else if (isSelected) {
              optionStyle = "border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-200 shadow-xs";
              badgeStyle = "bg-indigo-600 text-white border-indigo-600";
            }

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelectOption(index)}
                disabled={isAnswered || isSubmitting}
                className={`
                  w-full flex items-start text-left gap-3.5 p-4 sm:p-4.5 rounded-2xl border-2 transition-all duration-200
                  ${optionStyle}
                  ${!isAnswered ? "cursor-pointer active:scale-99" : "cursor-default"}
                `}
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border transition-colors ${badgeStyle}`}
                >
                  {optionPrefixes[index]}
                </span>
                <span className="text-sm sm:text-base font-medium leading-relaxed pt-0.5">
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Feedback Section (Appears after submission) */}
        <AnimatePresence>
          {evaluation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className={`p-4 sm:p-5 rounded-2xl mb-6 border ${
                  evaluation.isCorrect
                    ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-950"
                    : "bg-amber-50/80 border-amber-200/80 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
                  {evaluation.isCorrect ? (
                    <>
                      <CheckCircle2 size={17} className="text-emerald-600" />
                      <span className="text-emerald-700">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={17} className="text-amber-600" />
                      <span className="text-amber-700">Not quite.</span>
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
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
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
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <span>{isSubmitting ? "Checking..." : "Check Answer"}</span>
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleProceed}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white
                         rounded-xl text-base font-semibold hover:bg-indigo-700 
                         transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-98"
            >
              <span>{currentIndex + 1 === totalQuestions ? "See Diagnostic Results" : "Next Question"}</span>
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
