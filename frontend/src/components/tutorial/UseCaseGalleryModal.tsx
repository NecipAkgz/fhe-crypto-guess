import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface UseCaseGalleryModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const USE_CASES = [
  {
    id: "auction",
    title: "Blind Auction",
    icon: "🔨",
    description: "Bidders submit encrypted bids. The contract determines the winner and the highest price without revealing any losing bids.",
    tags: ["DeFi", "Privacy"],
    diagram: (
      <div className="flex flex-col items-center gap-4 text-xs">
        <div className="flex gap-8">
          <div className="p-2 border border-slate-700 rounded bg-slate-900">Bidder A (E(100))</div>
          <div className="p-2 border border-slate-700 rounded bg-slate-900">Bidder B (E(150))</div>
        </div>
        <div className="h-8 w-px bg-slate-600"></div>
        <div className="p-3 border border-indigo-500 rounded bg-indigo-500/10 text-indigo-200 font-bold">
          Smart Contract
          <div className="text-[10px] font-normal mt-1 text-indigo-300">Computes Max(E(A), E(B))</div>
        </div>
        <div className="h-8 w-px bg-slate-600"></div>
        <div className="p-2 border border-emerald-500 rounded bg-emerald-500/10 text-emerald-200">
          Winner: Bidder B
          <br />
          Price: 150
        </div>
      </div>
    )
  },
  {
    id: "voting",
    title: "Private Voting",
    icon: "🗳️",
    description: "DAO members vote Yes/No/Abstain. The contract tallies the total without ever revealing individual votes.",
    tags: ["DAO", "Governance"],
    diagram: (
      <div className="flex flex-col items-center gap-4 text-xs">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">👤</div>
          ))}
        </div>
        <div className="text-[10px] text-slate-500">Encrypted Votes (Yes/No)</div>
        <div className="h-8 w-px bg-slate-600"></div>
        <div className="p-3 border border-indigo-500 rounded bg-indigo-500/10 text-indigo-200 font-bold">
          Tally Contract
          <div className="text-[10px] font-normal mt-1 text-indigo-300">Sum(Votes)</div>
        </div>
        <div className="h-8 w-px bg-slate-600"></div>
        <div className="p-2 border border-emerald-500 rounded bg-emerald-500/10 text-emerald-200">
          Result: Passed (2 Yes, 1 No)
        </div>
      </div>
    )
  },
  {
    id: "did",
    title: "Encrypted DID",
    icon: "🆔",
    description: "Store personal data (age, credit score) encrypted on-chain. Contracts can verify 'Age > 18' without seeing the actual age.",
    tags: ["Identity", "Compliance"],
    diagram: (
      <div className="flex flex-col items-center gap-4 text-xs">
        <div className="p-2 border border-slate-700 rounded bg-slate-900">User Data: E(Age: 25)</div>
        <div className="h-8 w-px bg-slate-600"></div>
        <div className="p-3 border border-indigo-500 rounded bg-indigo-500/10 text-indigo-200 font-bold">
          Verifier Contract
          <div className="text-[10px] font-normal mt-1 text-indigo-300">Check: E(Age) {'>'} E(18)</div>
        </div>
        <div className="h-8 w-px bg-slate-600"></div>
        <div className="p-2 border border-emerald-500 rounded bg-emerald-500/10 text-emerald-200">
          Result: True (Access Granted)
        </div>
      </div>
    )
  },
  {
    id: "erc20",
    title: "Confidential ERC-20",
    icon: "💰",
    description: "Tokens where balances and transfer amounts are encrypted. Only the owner can see their own balance.",
    tags: ["DeFi", "Tokens"],
    diagram: (
      <div className="flex flex-col items-center gap-4 text-xs">
        <div className="flex justify-between w-full px-8">
          <div className="text-center">
            <div className="font-bold text-slate-300">Alice</div>
            <div className="text-[10px] text-slate-500">Bal: E(500)</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-300">Bob</div>
            <div className="text-[10px] text-slate-500">Bal: E(0)</div>
          </div>
        </div>
        <div className="w-full h-px bg-slate-700 relative my-2">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 text-[10px] text-sky-400">Transfer E(100)</div>
        </div>
        <div className="p-3 border border-indigo-500 rounded bg-indigo-500/10 text-indigo-200 font-bold">
          Token Contract
          <div className="text-[10px] font-normal mt-1 text-indigo-300">Alice -= E(100); Bob += E(100)</div>
        </div>
        <div className="flex justify-between w-full px-8 mt-2">
          <div className="text-center">
            <div className="text-[10px] text-emerald-400">New Bal: E(400)</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-emerald-400">New Bal: E(100)</div>
          </div>
        </div>
      </div>
    )
  }
];

export const UseCaseGalleryModal = ({ isVisible, onClose }: UseCaseGalleryModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [selectedCase, setSelectedCase] = useState(USE_CASES[0]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isVisible || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-5xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_60px_140px_-60px_rgba(15,23,42,0.9)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">🏛️ Use Case Gallery</h3>
            <p className="text-sm text-slate-400">Discover what&apos;s possible with Fully Homomorphic Encryption.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Close
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Navigation */}
          <div className="space-y-3">
            {USE_CASES.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => setSelectedCase(useCase)}
                className={`w-full flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  selectedCase.id === useCase.id
                    ? "border-sky-500/50 bg-sky-500/10"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                <span className="text-2xl">{useCase.icon}</span>
                <div>
                  <div className={`font-semibold ${selectedCase.id === useCase.id ? "text-sky-100" : "text-slate-300"}`}>
                    {useCase.title}
                  </div>
                  <div className="flex gap-2 mt-1">
                    {useCase.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8 flex flex-col h-full">
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                {selectedCase.icon} {selectedCase.title}
              </h4>
              <p className="mt-4 text-slate-300 leading-relaxed text-lg">
                {selectedCase.description}
              </p>
            </div>

            <div className="mt-auto rounded-xl border border-slate-800 bg-slate-950/50 p-8">
              <h5 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 text-center">Logic Flow</h5>
              {selectedCase.diagram}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
