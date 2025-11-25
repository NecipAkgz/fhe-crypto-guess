"use client";

import { useRef } from "react";
import GameBoard, { type GameBoardHandle } from "@/components/GameBoard";
import { FHE_EDUCATION_STEPS } from "@/lib/fheEducation";

const steps = [
  {
    title: "Connect Wallet",
    description: "Link your wallet to enable secure signing.",
  },
  {
    title: "Start Session",
    description: "Initialize an encrypted game session.",
  },
  {
    title: "Make Move",
    description: "Pick Rock, Paper, or Scissors privately.",
  },
  {
    title: "Reveal Result",
    description: "Decrypt the outcome locally.",
  },
];

const highlights = [
  {
    icon: "🔒",
    label: "Sealed Inputs",
    detail: "Client-side FHE keeps every move private until you decrypt.",
  },
  {
    icon: "⚖️",
    label: "Provable Fairness",
    detail: "Smart contracts compute blindly while remaining audit-friendly.",
  },
  {
    icon: "⚙️",
    label: "Dev Ready",
    detail: "Hardhat + FHEVM templates to ship privacy-preserving dApps fast.",
  },
  {
    icon: "🧪",
    label: "Encrypted UX",
    detail: "Inspect game flow without leaking plaintext intent.",
  },
];

export default function Home() {
  const gameBoardRef = useRef<GameBoardHandle>(null);

  return (
    <main className="relative min-h-screen overflow-hidden text-slate-100 selection:bg-sky-500/30">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-sky-500/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header Section */}
        <header className="flex flex-col items-center gap-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            Powered by Zama FHEVM
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl font-bold tracking-tight sm:text-5xl bg-gradient-to-b from-white via-slate-200 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
              FHE Guessing Game
            </h1>
            <p className="text-slate-400 leading-relaxed font-semibold max-w-2xl mx-auto">
              Experience the future of privacy-preserving gaming.
              Built with Fully Homomorphic Encryption to keep your moves secret, forever.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs animate-slide-up" style={{ animationDelay: "0.1s" }}>
            {highlights.map(({ icon, label, detail }) => (
              <div
                key={label}
                className="group relative inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-4 py-2 font-medium text-slate-300 transition-all hover:border-sky-500/30 hover:bg-sky-500/10 cursor-help"
                title={detail}
              >
                <span className="text-base group-hover:scale-110 transition-transform">{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start animate-slide-up" style={{ animationDelay: "0.2s" }}>
          {/* Game Board Area */}
          <div className="relative z-10">
            <GameBoard ref={gameBoardRef} steps={steps} />
          </div>

          {/* Mission Control / Onboarding */}
          <aside className="space-y-6 lg:sticky lg:top-8">
            <div className="glass-card rounded-3xl p-1">
              <div className="rounded-[22px] bg-slate-950/50 p-6 space-y-6">
                <div>
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sky-400">
                    <span className="h-px w-4 bg-sky-400/50"></span>
                    Mission Control
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Master the concepts of FHE through interactive modules.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => gameBoardRef.current?.startTutorial()}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 p-[1px] transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                  >
                    <div className="relative flex items-center gap-3 rounded-[11px] bg-slate-950/40 px-4 py-3 transition-colors group-hover:bg-transparent">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg">🚀</span>
                      <div className="text-left">
                        <div className="font-semibold text-white">Interactive Tutorial</div>
                        <div className="text-xs text-slate-300">Start your FHE journey here</div>
                      </div>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => gameBoardRef.current?.showEducation(1)}
                      className="glass-button flex flex-col items-start gap-2 rounded-xl p-3 text-left hover:bg-slate-800/50"
                    >
                      <span className="text-xl">📚</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">FHE Essentials</div>
                        <div className="text-[10px] text-slate-400">{FHE_EDUCATION_STEPS.length} Steps</div>
                      </div>
                    </button>

                    <button
                      onClick={() => gameBoardRef.current?.openGlossaryModal()}
                      className="glass-button flex flex-col items-start gap-2 rounded-xl p-3 text-left hover:bg-slate-800/50"
                    >
                      <span className="text-xl">🧠</span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">Glossary</div>
                        <div className="text-[10px] text-slate-400">Key terms</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deep Dive Modules</p>
                  <div className="grid gap-2">
                    {[
                      { label: "Environment Setup", action: () => gameBoardRef.current?.openEnvironmentModal(), icon: "🛠️" },
                      { label: "Write Contract", action: () => gameBoardRef.current?.openContractModal(), icon: "📝" },
                      { label: "Frontend Integration", action: () => gameBoardRef.current?.openFrontendModal(), icon: "🎨" },
                      { label: "Deploy & Test", action: () => gameBoardRef.current?.openDeploymentModal(), icon: "⚡" },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="flex items-center gap-3 rounded-lg border border-slate-800/50 bg-slate-900/30 px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-sky-500/30 hover:bg-sky-500/10 hover:text-sky-200"
                      >
                        <span className="opacity-70">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Advanced Labs</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => gameBoardRef.current?.openPlaygroundModal()}
                      className="glass-button flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-slate-800/50"
                    >
                      <span className="text-2xl">🧪</span>
                      <div className="text-xs font-semibold text-slate-200">Playground</div>
                    </button>
                    <button
                      onClick={() => gameBoardRef.current?.openSecurityModal()}
                      className="glass-button flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-slate-800/50"
                    >
                      <span className="text-2xl">🛡️</span>
                      <div className="text-xs font-semibold text-slate-200">Security</div>
                    </button>
                    <button
                      onClick={() => gameBoardRef.current?.openGasAnalyzerModal()}
                      className="glass-button flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-slate-800/50"
                    >
                      <span className="text-2xl">⛽</span>
                      <div className="text-xs font-semibold text-slate-200">Gas Analyzer</div>
                    </button>
                    <button
                      onClick={() => gameBoardRef.current?.openUseCaseGalleryModal()}
                      className="glass-button flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-slate-800/50"
                    >
                      <span className="text-2xl">🏛️</span>
                      <div className="text-xs font-semibold text-slate-200">Use Cases</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5 text-center">
              <p className="text-xs font-medium text-slate-400">
                Privacy is not an option, it&apos;s the default.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
