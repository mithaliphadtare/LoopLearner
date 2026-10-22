import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { LoopVisual } from "@/components/landing/LoopVisual";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Logo } from "@/components/shared/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      <main className="flex-1">
        <Hero />
        <LoopVisual />
        <HowItWorks />
      </main>
      <footer className="py-8 px-6 border-t border-slate-200/70 bg-stone-50 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-slate-500">
            &ldquo;Don&apos;t just get the answer. Master it.&rdquo; &bull; Built with Gemma
          </p>
        </div>
      </footer>
    </div>
  );
}
