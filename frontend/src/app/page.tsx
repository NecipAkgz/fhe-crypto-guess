import GameBoard from "@/components/GameBoard";

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
  return (
    <main className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-sky-500/20 via-emerald-500/10 to-transparent blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-6 py-20 sm:px-8 lg:px-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            Privacy-first demo
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            FHE Guessing Game
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            Play Rock–Paper–Scissors while your move never leaves your device in plain text. Fully Homomorphic Encryption keeps the contract honest and blind.
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-[0.8rem]">
          {highlights.map(({ icon, label, detail }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/40 px-4 py-2 font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200"
              title={detail}
            >
              <span aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </span>
          ))}
        </div>

        <section className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
          <GameBoard />

          <aside className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 backdrop-blur-xl lg:sticky lg:top-24">
            <h2 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
              How it works
            </h2>
            <ol className="mt-8 space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/70 text-xs font-semibold text-slate-200">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-200">{step.title}</p>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

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
