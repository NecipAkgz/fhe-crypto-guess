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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">FHE Learning Module - Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            Skip Tutorial
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-slate-700 leading-relaxed">{currentStep?.description}</p>

          {currentStep?.code && (
            <CodeBlock
              code={currentStep.code}
              language="solidity"
              title="Smart Contract Example"
            />
          )}
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">🎯 Key Takeaway</h4>
          <p className="text-sm text-blue-800">
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
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
