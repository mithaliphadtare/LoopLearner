"use client";

import { motion } from "framer-motion";
import { Upload, Sparkles, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "UPLOAD",
    description: "Show LearnLoop what you're studying.",
    icon: Upload,
  },
  {
    number: "02",
    title: "UNDERSTAND",
    description: "AI identifies the topic and key concepts.",
    icon: Sparkles,
  },
  {
    number: "03",
    title: "MASTER",
    description: "Practice and adapt until you understand it.",
    icon: CheckCircle2,
  },
];

/** Compact, transparent 3-step section aligned strictly with the spec. */
export function HowItWorks() {
  return (
    <section className="py-16 md:py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
            How it works
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            A focused loop from study material to genuine comprehension.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100/70 flex items-center justify-center text-indigo-600">
                    <step.icon size={20} strokeWidth={2.25} />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-slate-300">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-sm font-bold tracking-wider text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
