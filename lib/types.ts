import type { AnalysisResult } from "./schemas/analysis";
import type {
  ClientDiagnosticQuestion,
  DiagnosticAssessmentResult,
} from "./schemas/diagnostic";
import type {
  ClientTargetedTeaching,
  ClientSimplerExplanation,
} from "./schemas/teaching";

/**
 * Application-wide type definitions.
 * Manages states across Material -> Understand -> Diagnostic -> Targeted Teaching & Adaptive Remediation.
 */

/** The stages of the learning loop. */
export type LearningStage = "material" | "understand" | "practice" | "master";

/** State of the current learning session. */
export interface LearningSession {
  /** The uploaded study image or PDF as a data URL. */
  uploadedImage: string | null;
  /** The file name of the uploaded material. */
  fileName: string | null;
  /** The MIME type of the uploaded file. */
  fileType?: string | null;
  /** The file size in bytes. */
  fileSize?: number | null;
  /** The structured analysis result from the AI. */
  analysis: AnalysisResult | null;
  /** The current stage in the learning loop. */
  currentStage: LearningStage;

  // --- Phase 2: Diagnostic Assessment State ---
  diagnosticSessionId: string | null;
  diagnosticQuestions: ClientDiagnosticQuestion[];
  studentAnswers: Record<string, number>;
  diagnosticResult: DiagnosticAssessmentResult | null;
  weakConcepts: string[];

  // --- Phase 3: Targeted Guidance & Adaptive Remediation State ---
  teachingQueue: string[];
  currentTeachingIndex: number;
  currentTeachingContent: ClientTargetedTeaching | null;
  currentSimplerContent: ClientSimplerExplanation | null;
  isRemediationMode: boolean; // true if currently viewing simpler second-pass explanation
  masteredConcepts: string[];
}

/** The initial empty session state. */
export const INITIAL_SESSION: LearningSession = {
  uploadedImage: null,
  fileName: null,
  fileType: null,
  fileSize: null,
  analysis: null,
  currentStage: "material",
  diagnosticSessionId: null,
  diagnosticQuestions: [],
  studentAnswers: {},
  diagnosticResult: null,
  weakConcepts: [],
  teachingQueue: [],
  currentTeachingIndex: 0,
  currentTeachingContent: null,
  currentSimplerContent: null,
  isRemediationMode: false,
  masteredConcepts: [],
};
