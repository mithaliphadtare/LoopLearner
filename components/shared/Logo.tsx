"use client";

import { RefreshCw } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { icon: 16, text: "text-lg", container: "w-7 h-7 rounded-md" },
  md: { icon: 20, text: "text-xl", container: "w-8 h-8 rounded-lg" },
  lg: { icon: 24, text: "text-2xl", container: "w-10 h-10 rounded-xl" },
};

/** LearnLoop logo mark — clean modern loop icon with the product name. */
export function Logo({ size = "md" }: LogoProps) {
  const { icon, text, container } = sizeMap[size];
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative flex items-center justify-center ${container} bg-indigo-50 border border-indigo-100/80 shadow-xs`}>
        <RefreshCw size={icon} className="text-indigo-600 animate-spin-slow" strokeWidth={2.5} />
      </div>
      <span className={`${text} font-bold tracking-tight text-slate-900`}>
        Learn<span className="text-indigo-600">Loop</span>
      </span>
    </div>
  );
}
