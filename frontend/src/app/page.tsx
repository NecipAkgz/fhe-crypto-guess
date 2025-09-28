"use client";

import { useRef } from "react";
import GameBoard, { type GameBoardHandle } from "@/components/GameBoard";

const steps = [
  {
    title: "Connect your wallet",
    description: "Use the connect button to link your wallet and enable signing.",
  },
  {
    title: "Start a session",
    description: "Kick off an encrypted match with a single click.",
  },
  {
    title: "Make a move",
    description: "Pick Rock, Paper, or Scissors; your selection stays local.",
  },
  {
    title: "Review the outcome",
    description: "Only you see the decrypted result while the contract remains blind.",
  },
];

const highlights = [
  {
    icon: "🔒",
    label: "Sealed inputs",
    detail: "Client-side FHE keeps every move private until you decrypt.",
  },
  {
    icon: "⚖️",
    label: "Provable fairness",
    detail: "Smart contracts compute blindly while remaining audit-friendly.",
  },
  {
    icon: "⚙️",
    label: "Dev ready",
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
    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-sky-500/20 via-emerald-500/10 to-transparent blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            FHE Guessing Game
          </h1>
          <p className="max-w-xl text-sm text-slate-300">
            Experience privacy-preserving gaming with Fully Homomorphic Encryption technology
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          {highlights.map(({ icon, label, detail }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full border border-slate-800/60 bg-slate-900/40 px-3 py-1 font-semibold text-slate-300"
              title={detail}
            >
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
          <GameBoard ref={gameBoardRef} steps={steps} />

          <aside className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-xl lg:sticky lg:top-24">
            <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              Quick onboarding
            </h2>
            <p className="mt-6 text-sm text-slate-300">
              Get oriented fast, then dive straight into encrypted play.
            </p>

            <div className="mt-6 grid gap-3 text-sm">
              <button
                onClick={() => gameBoardRef.current?.startTutorial()}
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400"
              >
                🚀 Launch interactive tutorial
              </button>
              <button
                onClick={() => gameBoardRef.current?.showEducation(1)}
                className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-4 py-2 font-semibold text-slate-200 transition hover:border-sky-400/50 hover:text-sky-200"
              >
                📚 FHE essentials (3 steps)
              </button>
            </div>

            <div className="mt-8 space-y-3 text-xs text-slate-300">
              <p className="uppercase tracking-[0.35em] text-slate-500">Deep dive modules</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => gameBoardRef.current?.openEnvironmentModal()}
                  className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                >
                  Environment setup
                </button>
                <button
                  onClick={() => gameBoardRef.current?.openContractModal()}
                  className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                >
                  Smart contract
                </button>
                <button
                  onClick={() => gameBoardRef.current?.openFrontendModal()}
                  className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                >
                  Frontend integration
                </button>
                <button
                  onClick={() => gameBoardRef.current?.openDeploymentModal()}
                  className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                >
                  Deploy & test
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-800/60 bg-slate-900/60 px-5 py-4 text-sm text-slate-300">
              <p className="font-medium text-slate-100">Encrypted from end to end</p>
              <p className="mt-2 leading-relaxed text-slate-400">
                Your move is sealed before submission. The contract operates on ciphertexts, so only you can decrypt the outcome.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
