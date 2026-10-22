"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { ProgressHeader } from "@/components/shared/ProgressHeader";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { ImagePreview } from "@/components/upload/ImagePreview";
import { AnalyzingIndicator } from "@/components/analysis/AnalyzingIndicator";
import { AnalysisResultView } from "@/components/analysis/AnalysisResultView";
import { DiagnosticLoadingIndicator } from "@/components/diagnostic/DiagnosticLoadingIndicator";
import { DiagnosticQuestionCard } from "@/components/diagnostic/DiagnosticQuestionCard";
import { DiagnosticResultsView } from "@/components/diagnostic/DiagnosticResultsView";
import { GuidanceOverview } from "@/components/teaching/GuidanceOverview";
import { TeachingLoadingIndicator } from "@/components/teaching/TeachingLoadingIndicator";
import { TargetedLessonView } from "@/components/teaching/TargetedLessonView";
import { SimplerLessonView } from "@/components/teaching/SimplerLessonView";
import { MasteryCompleteView } from "@/components/teaching/MasteryCompleteView";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { getMimeType } from "@/lib/utils";
import type { LearningSession } from "@/lib/types";
import { INITIAL_SESSION } from "@/lib/types";

export default function LearnPage() {
  const [session, setSession] = useState<LearningSession>(INITIAL_SESSION);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingDiagnostic, setIsGeneratingDiagnostic] = useState(false);
  const [isGeneratingTeaching, setIsGeneratingTeaching] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [teachingSessionId, setTeachingSessionId] = useState<string | null>(null);
  const [showGuidanceOverview, setShowGuidanceOverview] = useState(false);
  const [isMasteryScreen, setIsMasteryScreen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    message: string;
    retryAction?: () => void;
  } | null>(null);

  // Phase 1: Upload handler
  const handleImageSelected = (
    dataUrl: string,
    fileName: string,
    fileType?: string,
    fileSize?: number
  ) => {
    setErrorMessage(null);
    setSession({
      ...INITIAL_SESSION,
      uploadedImage: dataUrl,
      fileName,
      fileType: fileType || getMimeType(dataUrl),
      fileSize: fileSize || null,
    });
  };

  // Reset entire flow
  const handleReset = () => {
    setErrorMessage(null);
    setIsAnalyzing(false);
    setIsGeneratingDiagnostic(false);
    setIsGeneratingTeaching(false);
    setCurrentQuestionIndex(0);
    setTeachingSessionId(null);
    setShowGuidanceOverview(false);
    setIsMasteryScreen(false);
    setSession(INITIAL_SESSION);
  };

  // Phase 1: Material Analysis call
  const handleAnalyze = async () => {
    if (!session.uploadedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const mimeType = session.fileType || getMimeType(session.uploadedImage);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: session.uploadedImage,
          mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Analysis failed");
      }

      setSession((prev) => ({
        ...prev,
        analysis: data.data,
        currentStage: "understand",
      }));
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Something went wrong while understanding this page.";
      setErrorMessage({
        title: "Analysis Failed",
        message: text,
        retryAction: handleAnalyze,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Phase 2: Start Diagnostic generation
  const handleStartDiagnostic = async () => {
    if (!session.analysis) return;

    setIsGeneratingDiagnostic(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          analysis: session.analysis,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate diagnostic questions");
      }

      setSession((prev) => ({
        ...prev,
        diagnosticSessionId: data.sessionId,
        diagnosticQuestions: data.questions,
        currentStage: "practice",
      }));
      setCurrentQuestionIndex(0);
    } catch (err: unknown) {
      const text =
        err instanceof Error ? err.message : "Something went wrong while preparing your diagnostic.";
      setErrorMessage({
        title: "Diagnostic Generation Failed",
        message: text,
        retryAction: handleStartDiagnostic,
      });
    } finally {
      setIsGeneratingDiagnostic(false);
    }
  };

  // Phase 2: Question answered, proceed to next or evaluate
  const handleNextQuestion = async (
    questionId: string,
    selectedOption: number
  ) => {
    const updatedAnswers = {
      ...session.studentAnswers,
      [questionId]: selectedOption,
    };

    setSession((prev) => ({
      ...prev,
      studentAnswers: updatedAnswers,
    }));

    if (currentQuestionIndex + 1 < session.diagnosticQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsGeneratingDiagnostic(true);
      try {
        const response = await fetch("/api/diagnostic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "evaluate",
            sessionId: session.diagnosticSessionId,
            answers: updatedAnswers,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to evaluate diagnostic assessment");
        }

        setSession((prev) => ({
          ...prev,
          diagnosticResult: data.result,
          weakConcepts: data.result.weakConcepts,
          currentStage: "practice",
        }));
      } catch (err: unknown) {
        const text =
          err instanceof Error ? err.message : "Error evaluating diagnostic results.";
        setErrorMessage({
          title: "Evaluation Failed",
          message: text,
        });
      } finally {
        setIsGeneratingDiagnostic(false);
      }
    }
  };

  // Phase 3: Transition from Diagnostic Results into Targeted Guidance Overview
  const handleInitiateTargetedGuidance = () => {
    if (!session.diagnosticResult) return;

    // Prioritize teaching queue: weak concepts first, or all concepts if all strong
    const queue =
      session.weakConcepts.length > 0
        ? [...session.weakConcepts]
        : session.diagnosticResult.conceptPerformance.map((c) => c.concept);

    setSession((prev) => ({
      ...prev,
      teachingQueue: queue,
      currentTeachingIndex: 0,
      currentStage: "master",
    }));

    setShowGuidanceOverview(true);
  };

  // Phase 3: Load lesson for current concept in queue
  const loadTargetedLesson = async (conceptName: string) => {
    if (!session.analysis || !session.diagnosticResult) return;

    setIsGeneratingTeaching(true);
    setErrorMessage(null);
    setShowGuidanceOverview(false);

    const strongConcepts = session.diagnosticResult.conceptPerformance
      .filter((c) => c.status === "Strong")
      .map((c) => c.concept);

    // Find diagnostic question where student erred on this concept if available
    let missedQuestionText: string | undefined;
    let studentAnsText: string | undefined;
    let correctAnsText: string | undefined;

    const matchedQ = session.diagnosticQuestions.find((q) => q.concept === conceptName);
    if (matchedQ && session.studentAnswers[matchedQ.id] !== undefined) {
      const selectedIdx = session.studentAnswers[matchedQ.id];
      missedQuestionText = matchedQ.question;
      studentAnsText = matchedQ.options[selectedIdx];
    }

    try {
      const response = await fetch("/api/teaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_lesson",
          topic: session.analysis.topic,
          concept: conceptName,
          strongConcepts,
          weakConcepts: session.weakConcepts,
          questionText: missedQuestionText,
          studentAnswerText: studentAnsText,
          correctAnswerText: correctAnsText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to generate targeted lesson");
      }

      setTeachingSessionId(data.teachingSessionId);
      setSession((prev) => ({
        ...prev,
        currentTeachingContent: data.content,
        currentSimplerContent: null,
        isRemediationMode: false,
      }));
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Failed to load personalized lesson.";
      setErrorMessage({
        title: "Lesson Preparation Failed",
        message: text,
        retryAction: () => loadTargetedLesson(conceptName),
      });
    } finally {
      setIsGeneratingTeaching(false);
    }
  };

  // Phase 3: Student mastered check question
  const handleLessonMastered = (concept: string) => {
    const updatedMastered = [...new Set([...session.masteredConcepts, concept])];
    const nextIdx = session.currentTeachingIndex + 1;

    setSession((prev) => ({
      ...prev,
      masteredConcepts: updatedMastered,
      currentTeachingIndex: nextIdx,
      currentTeachingContent: null,
      currentSimplerContent: null,
      isRemediationMode: false,
    }));

    if (nextIdx < session.teachingQueue.length) {
      // Advance to next prioritized weak concept
      loadTargetedLesson(session.teachingQueue[nextIdx]);
    } else {
      // Completed all focus concepts!
      setIsMasteryScreen(true);
    }
  };

  // Phase 3: Student missed check question -> fetch simpler explanation + analogy
  const handleRequestSimplerExplanation = async (
    previousQuestion: string,
    studentAnswer: string
  ) => {
    const currentConcept = session.teachingQueue[session.currentTeachingIndex];
    if (!currentConcept || !session.analysis) return;

    setIsGeneratingTeaching(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/teaching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "simpler_explanation",
          topic: session.analysis.topic,
          concept: currentConcept,
          previousQuestion,
          studentAnswer,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch alternative explanation");
      }

      setTeachingSessionId(data.teachingSessionId);
      setSession((prev) => ({
        ...prev,
        currentSimplerContent: data.content,
        isRemediationMode: true,
      }));
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : "Error generating simpler analogy";
      setErrorMessage({
        title: "Remediation Failed",
        message: text,
      });
    } finally {
      setIsGeneratingTeaching(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Return home"
            >
              <ArrowLeft size={18} />
            </Link>
            <Logo size="sm" />
          </div>

          <div className="text-xs font-semibold tracking-wider uppercase text-slate-400">
            Interactive Learning Session
          </div>
        </div>

        {/* Learning Stage Progress Bar */}
        <div className="border-t border-slate-100 bg-stone-50/60 py-2.5">
          <ProgressHeader currentStage={session.currentStage} />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
        {errorMessage && (
          <div className="mb-8">
            <ErrorMessage
              title={errorMessage.title}
              message={errorMessage.message}
              onRetry={errorMessage.retryAction || handleReset}
            />
          </div>
        )}

        {/* 1. Analyzing Image State */}
        {isAnalyzing ? (
          <AnalyzingIndicator />
        ) : /* 2. Generating Diagnostic Questions State */
        isGeneratingDiagnostic ? (
          <DiagnosticLoadingIndicator />
        ) : /* 3. Generating Targeted Teaching State */
        isGeneratingTeaching ? (
          <TeachingLoadingIndicator
            concept={session.teachingQueue[session.currentTeachingIndex]}
          />
        ) : /* 4. All Targeted Concepts Mastered Screen */
        isMasteryScreen && session.analysis ? (
          <MasteryCompleteView
            topic={session.analysis.topic}
            masteredConcepts={session.masteredConcepts}
            totalWeakConcepts={session.teachingQueue.length}
            onReset={handleReset}
          />
        ) : /* 5. Simpler Remediation Lesson View (Second-Pass Analogy) */
        session.isRemediationMode && session.currentSimplerContent && teachingSessionId ? (
          <SimplerLessonView
            content={session.currentSimplerContent}
            teachingSessionId={teachingSessionId}
            onRemediationMastered={handleLessonMastered}
            onProceedAnyway={handleLessonMastered}
          />
        ) : /* 6. Active Targeted Lesson Screen (Phase 3) */
        session.currentTeachingContent && teachingSessionId ? (
          <TargetedLessonView
            lesson={session.currentTeachingContent}
            teachingSessionId={teachingSessionId}
            conceptIndex={session.currentTeachingIndex}
            totalConcepts={session.teachingQueue.length}
            onLessonMastered={handleLessonMastered}
            onRequestSimplerExplanation={handleRequestSimplerExplanation}
          />
        ) : /* 7. Guidance Overview Queue Screen (Phase 3 Entry) */
        showGuidanceOverview && session.diagnosticResult && session.analysis ? (
          <GuidanceOverview
            strongConcepts={session.diagnosticResult.conceptPerformance
              .filter((c) => c.status === "Strong")
              .map((c) => c.concept)}
            weakConcepts={session.teachingQueue}
            topic={session.analysis.topic}
            onProceedToLesson={() =>
              loadTargetedLesson(session.teachingQueue[session.currentTeachingIndex])
            }
          />
        ) : /* 8. Diagnostic Results View (Phase 2) */
        session.diagnosticResult && session.analysis ? (
          <DiagnosticResultsView
            result={session.diagnosticResult}
            topic={session.analysis.topic}
            onReset={handleReset}
            onStartLearning={handleInitiateTargetedGuidance}
          />
        ) : /* 9. Active Diagnostic Questions Flow (Phase 2) */
        session.diagnosticQuestions.length > 0 && session.diagnosticSessionId ? (
          <DiagnosticQuestionCard
            key={session.diagnosticQuestions[currentQuestionIndex].id}
            question={session.diagnosticQuestions[currentQuestionIndex]}
            currentIndex={currentQuestionIndex}
            totalQuestions={session.diagnosticQuestions.length}
            sessionId={session.diagnosticSessionId}
            onNextQuestion={handleNextQuestion}
          />
        ) : /* 10. Material Analysis Result Screen (Phase 1) */
        session.analysis ? (
          <AnalysisResultView
            analysis={session.analysis}
            onReset={handleReset}
            onStartDiagnostic={handleStartDiagnostic}
            diagnosticAvailable={true}
          />
        ) : /* 11. Uploaded Image Preview (Phase 1) */
        session.uploadedImage ? (
          <ImagePreview
            imageSrc={session.uploadedImage}
            fileName={session.fileName}
            fileSize={session.fileSize}
            fileType={session.fileType}
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            isAnalyzing={isAnalyzing}
          />
        ) : /* 12. Initial Upload Dropzone */
        (
          <UploadDropzone onImageSelected={handleImageSelected} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-200/70 bg-white/60 text-center">
        <p className="text-xs text-slate-400">
          LearnLoop &bull; Adaptive AI Tutor &bull; Material &rarr; Understand &rarr; Diagnostic &rarr; Targeted Mastery
        </p>
      </footer>
    </div>
  );
}
