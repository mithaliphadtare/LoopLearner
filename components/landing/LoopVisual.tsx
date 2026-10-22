"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, RotateCw, Trophy } from "lucide-react";

const loopSteps = [
  { icon: BookOpen, label: "Understand", desc: "Identify key concepts" },
  { icon: Brain, label: "Practice", desc: "Diagnose understanding" },
  { icon: RotateCw, label: "Adapt", desc: "Target misconceptions" },
  { icon: Trophy, label: "Master", desc: "Retest until fluent" },
];

/** Subtle, product-native visual representation of the learning loop. */
export function LoopVisual() {
  return (
    <section className="py-8 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs"
        >
          <div className="text-center mb-6">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
              The Learning Loop
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {loopSteps.map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + index * 0.08 }}
                className="flex flex-col items-center text-center p-3.5 rounded-xl bg-stone-50 border border-slate-100"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-2.5">
                  <step.icon size={19} className="text-indigo-600" strokeWidth={2.25} />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-0.5">
                  {step.label}
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
