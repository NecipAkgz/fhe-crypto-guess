import { CodeBlock } from '../shared/SyntaxHighlighter';

interface FHEEducationModalProps {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const educationSteps = [
  {
    title: "🔐 What is Fully Homomorphic Encryption?",
    description: "Fully Homomorphic Encryption (FHE) is a revolutionary cryptographic technique that allows computations to be performed directly on encrypted data. In traditional systems, you need to decrypt data before processing it, exposing sensitive information. FHE eliminates this vulnerability by enabling 'blind computation' - your private data stays encrypted throughout the entire process.",
    code: `// Traditional Blockchain (INSECURE):
// function makeMove(uint8 move) public {
//     playerMove = move;  // ❌ Visible to everyone!
//     result = computeResult(move, computerMove);
// }

// FHEVM Approach (SECURE):
// function makeMove(euint8 encryptedMove) public {
//     euint8 result = computeFHE(encryptedMove, computerChoice);
//     // ✅ Everything stays encrypted!
// }`
  },
  {
    title: "🛡️ Why Do We Need FHE?",
    description: "Blockchain's transparency is both a strength and a weakness. While it ensures trust through visibility, it also means sensitive data like your game moves, voting choices, or financial information becomes public. FHE solves this privacy paradox by enabling confidential smart contracts where the computation logic remains transparent while user data stays completely private.",
    code: `// PRIVACY COMPARISON:

// Without FHE:
playerMove = 0;        // 🟡 Visible on-chain
computerMove = 1;      // 🟡 Visible on-chain
result = "You Lost";   // 🟡 Visible on-chain

// With FHE:
E(playerMove) = "E(0)";     // 🟢 Encrypted
E(computerMove) = "E(1)";   // 🟢 Encrypted
E(result) = "E(false)";     // 🟢 Only you can decrypt!`
  },
  {
    title: "⚡ How FHE Magic Works",
    description: "FHE uses advanced mathematical operations (homomorphic means 'same structure') that preserve the ability to perform calculations on ciphertexts. When you encrypt your move, the smart contract can compare it with the computer's encrypted choice and produce an encrypted result - all without ever seeing the plaintext values. Only you hold the decryption key to reveal the final outcome.",
    code: `// FHE Mathematical Operations:
// E(a) + E(b) = E(a + b)  ✅ Addition works!
// E(a) × E(b) = E(a × b)  ✅ Multiplication works!
// E(a) == E(b) = E(a == b) ✅ Comparison works!

// Your game flow:
// 1. You encrypt: "Rock" → E(0)
// 2. Contract computes: E(0) vs E(1) = E(false)
// 3. You decrypt: E(false) → "You lost!"
// 4. No one else learns your move! 🎉`
  }
];

export const FHEEducationModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: FHEEducationModalProps) => {
  if (!isVisible) return null;

  const currentStep = educationSteps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-3xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_60px_140px_-60px_rgba(15,23,42,0.9)]">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-lg font-bold text-sky-200">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-100">{currentStep?.title}</h3>
            <p className="text-sm text-slate-400">FHE Learning Module - Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-3 py-1 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Skip Tutorial
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="leading-relaxed text-slate-300">{currentStep?.description}</p>

          {currentStep?.code && (
            <CodeBlock
              code={currentStep.code}
              language="solidity"
              title="Smart Contract Example"
            />
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5">
          <h4 className="mb-2 text-sm font-semibold text-sky-200">🎯 Key Takeaway</h4>
          <p className="text-sm text-sky-100/90">
            {step === 1 && "FHE allows computations on encrypted data without decryption, enabling privacy-preserving smart contracts."}
            {step === 2 && "Traditional encryption requires decryption before processing, exposing sensitive data. FHE keeps everything encrypted."}
            {step === 3 && "FHE uses advanced mathematics to perform operations on ciphertexts, producing encrypted results."}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="rounded-full border border-slate-800/70 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Step {step} of 3</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-400"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400"
              >
                Start Building! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
