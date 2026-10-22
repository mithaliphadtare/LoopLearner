"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { LearningStage } from "@/lib/types";

interface Stage {
  id: LearningStage;
  label: string;
  number: string;
}

const stages: Stage[] = [
  { id: "material", label: "Material", number: "01" },
  { id: "understand", label: "Understand", number: "02" },
  { id: "practice", label: "Practice", number: "03" },
  { id: "master", label: "Master", number: "04" },
];

interface ProgressHeaderProps {
  currentStage: LearningStage;
}

function getStageStatus(
  stageId: LearningStage,
  currentStage: LearningStage
): "completed" | "current" | "upcoming" {
  const stageOrder: LearningStage[] = [
    "material",
    "understand",
    "practice",
    "master",
  ];
  const currentIndex = stageOrder.indexOf(currentStage);
  const stageIndex = stageOrder.indexOf(stageId);
  if (stageIndex < currentIndex) return "completed";
  if (stageIndex === currentIndex) return "current";
  return "upcoming";
}

/** Reusable learning-progress indicator that highlights the current stage. */
export function ProgressHeader({ currentStage }: ProgressHeaderProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-3">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id, currentStage);
          return (
            <div key={stage.id} className="flex items-center flex-1 last:flex-none">
              {/* Stage indicator */}
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
                  className={`
                    w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold
                    transition-all duration-300
                    ${status === "completed"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : status === "current"
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-sm"
                        : "bg-slate-100 text-slate-400 border border-slate-200/60"
                    }
                  `}
                >
                  {status === "completed" ? (
                    <Check size={16} strokeWidth={2.75} />
                  ) : (
                    stage.number
                  )}
                </motion.div>
                <span
                  className={`
                    text-xs font-medium transition-colors duration-300
                    ${status === "completed"
                      ? "text-indigo-600"
                      : status === "current"
                        ? "text-slate-900 font-semibold"
                        : "text-slate-400"
                    }
                  `}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line */}
              {index < stages.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 mt-[-1.25rem]">
                  <div className="h-0.5 bg-slate-200/80 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{
                        width:
                          getStageStatus(stages[index + 1].id, currentStage) !== "upcoming"
                            ? "100%"
                            : status === "current"
                              ? "50%"
                              : "0%",
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
