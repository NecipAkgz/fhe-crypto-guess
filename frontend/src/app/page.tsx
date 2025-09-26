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

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="rounded-full border border-slate-200 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Privacy-first demo
          </span>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            FHE Guessing Game
          </h1>
          <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
            Play Rock–Paper–Scissors while your move never leaves your device in plain
            text. Fully Homomorphic Encryption keeps the contract honest and blind.
          </p>
        </header>

        <section className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <GameBoard />

          <aside className="rounded-2xl border border-slate-200 bg-white/70 p-6 backdrop-blur lg:sticky lg:top-20">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              How it works
            </h2>
            <ol className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-800">{step.title}</p>
                    <p className="text-sm text-slate-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-xl border-l-4 border-slate-900 bg-slate-900/5 px-5 py-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900">Encrypted from end to end</p>
              <p className="mt-2 leading-relaxed">
                Your move is sealed before submission. The contract operates on ciphertexts,
                so only you can decrypt the outcome.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
