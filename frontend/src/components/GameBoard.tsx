"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { startNewGame, makeGuess, getGameResult, checkServices } from "@/lib/game";
import { type ServiceStatus } from "@/lib/serviceStatus";
import { ethers } from "ethers";

// FHE Education Component
const FHEEducationStep = ({
  step,
  title,
  description,
  code,
  isVisible,
  onClose
}: {
  step: number;
  title: string;
  description: string;
  code?: string;
  isVisible: boolean;
  onClose: () => void;
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
            {step}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">FHE Learning Step</p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-slate-700 leading-relaxed">{description}</p>

          {code && (
            <div className="rounded-lg bg-slate-900 p-4 text-sm">
              <pre className="text-green-400">
                <code>{code}</code>
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// Encryption Progress Component
const EncryptionProgress = ({
  currentStep,
  totalSteps
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="mb-6 rounded-xl bg-blue-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-blue-900">Encryption Progress</h4>
        <span className="text-xs text-blue-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="mb-3 flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentStep ? "bg-blue-500" : "bg-blue-200"
            }`}
          />
        ))}
      </div>

      <div className="text-xs text-blue-700">
        {currentStep === 1 && "🔐 Generating encryption keys..."}
        {currentStep === 2 && "📝 Encrypting your choice..."}
        {currentStep === 3 && "⛓️ Sending to blockchain..."}
        {currentStep === 4 && "🔍 Computing result (blind)..."}
        {currentStep === 5 && "🔓 Decrypting result..."}
      </div>
    </div>
  );
};

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const choices = [
  { id: 0, label: "Rock", icon: "🪨", tone: "from-slate-200/80 via-slate-50 to-slate-100" },
  { id: 1, label: "Paper", icon: "📄", tone: "from-stone-200/70 via-white to-stone-100" },
  { id: 2, label: "Scissors", icon: "✂️", tone: "from-zinc-200/80 via-white to-zinc-100" },
];

export default function GameBoard() {
  const { address, isConnected, connectWallet } = useWallet();
  const [gameId, setGameId] = useState<number | null>(null);
  const [result, setResult] = useState<{won: boolean, choice: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // FHE Education states
  const [currentEducationStep, setCurrentEducationStep] = useState(0);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // FHE Education content
  const educationSteps = [
    {
      title: "What is Fully Homomorphic Encryption?",
      description: "FHE allows computations to be performed on encrypted data without decrypting it first. This means your move stays secret while the smart contract can still process the game logic.",
      code: `// Your choice: "Rock" (plaintext)
// After FHE encryption: "E(ROCK)" (ciphertext)
// Contract computes: E(ROCK) vs E(PAPER) = E(WIN/LOSE)
// Only you can decrypt: E(WIN) → "You won!"`
    },
    {
      title: "Why Do We Need FHE?",
      description: "Traditional encryption requires decrypting data before processing, which exposes your private information. FHE keeps everything encrypted throughout the entire process, ensuring your move never leaves your device in plain text.",
      code: `// Traditional approach:
// 1. Send "Rock" to contract ❌ (visible to everyone)
// 2. Contract processes "Rock" ❌ (can be manipulated)

// FHE approach:
// 1. Send E("Rock") to contract ✅ (encrypted)
// 2. Contract processes E("Rock") ✅ (blind computation)`
    },
    {
      title: "How FHE Works",
      description: "FHE uses advanced mathematical operations that work on encrypted data. The contract performs calculations on ciphertexts and produces an encrypted result that only you can decrypt with your private key.",
      code: `// Mathematical magic:
// E(a) + E(b) = E(a + b)
// E(a) × E(b) = E(a × b)
// Your move + Contract logic = Encrypted result`
    }
  ];

  // Show education modal
  const showEducation = (step: number) => {
    setCurrentEducationStep(step);
    setShowEducationModal(true);
  };

  // Simulate encryption progress
  const simulateEncryption = async () => {
    setShowProgress(true);
    setEncryptionProgress(0);

    const steps = [1, 2, 3, 4, 5];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setEncryptionProgress(step);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setShowProgress(false);
  };

  // Check service status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkServices();
        setServiceStatus(status);
        setDemoMode(status.demoMode);
      } catch (error) {
        console.log("Service check failed:", error);
        setDemoMode(true);
      }
    };

    checkStatus();
  }, []);

  const handleStartGame = async () => {
    if (!isConnected) {
      connectWallet();
      return;
    }

    setLoading(true);
    try {
      // Create a dummy signer for now - in real app you'd get this from wagmi
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      const tx = await startNewGame(signer);
      // Game ID'yi transaction'dan al - simplified for demo
      setGameId(1);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Error starting game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeGuess = async (choice: number) => {
    if (!gameId) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      await makeGuess(signer, gameId, choice);

      // Sonucu al
      const gameResult = await getGameResult(signer, gameId);
      setResult(gameResult);
    } catch (error) {
      console.error("Error making guess:", error);
      alert("Error making guess. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getChoiceName = (choice: number) => {
    switch (choice) {
      case 0: return "Rock";
      case 1: return "Paper";
      case 2: return "Scissors";
      default: return "Unknown";
    }
  };

  const primaryButton =
    "w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400";
  const subtleButton =
    "rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <FHEEducationStep
        step={currentEducationStep + 1}
        title={educationSteps[currentEducationStep]?.title || ""}
        description={educationSteps[currentEducationStep]?.description || ""}
        code={educationSteps[currentEducationStep]?.code}
        isVisible={showEducationModal}
        onClose={() => setShowEducationModal(false)}
      />

      <section className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white/90 p-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Play a round</h2>
              <p className="text-sm text-slate-500">
                Start an encrypted match and keep every move hidden from the contract.
              </p>
            </div>

            {/* FHE Education Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => showEducation(0)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                title="Learn about FHE"
              >
                📚 What is FHE?
              </button>
              <button
                onClick={() => showEducation(1)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                title="Why FHE is needed"
              >
                ❓ Why FHE?
              </button>
              <button
                onClick={() => showEducation(2)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                title="How FHE works"
              >
                ⚙️ How it works
              </button>
            </div>
          </div>

          {/* Show encryption progress when active */}
          {showProgress && (
            <EncryptionProgress currentStep={encryptionProgress} totalSteps={5} />
          )}
        </header>

      {serviceStatus && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            demoMode
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <p className="font-medium">
            {demoMode ? "Demo mode" : "FHEVM Ready"}
          </p>
          <p className="mt-1 text-xs opacity-80">
            {demoMode
              ? "Relayer service unavailable. Using fallback mode with mock responses."
              : "Zama Relayer is online. Your moves are fully encrypted and secure."}
          </p>
        </div>
      )}

      {!isConnected ? (
        <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <p className="text-sm text-slate-600">Connect your wallet to begin.</p>
          <button onClick={connectWallet} className={primaryButton}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-3 text-xs text-slate-500">
            <span>Connected</span>
            <span className="font-medium text-slate-700">
              {address?.slice(0, 6)}…{address?.slice(-4)}
            </span>
          </div>

          {!gameId ? (
            <button
              onClick={handleStartGame}
              disabled={loading}
              className={primaryButton}
            >
              {loading ? "Starting…" : "Start New Game"}
            </button>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="space-y-3 text-center">
                <h3 className="text-sm font-medium uppercase tracking-[0.3em] text-slate-500">
                  Make your move
                </h3>
                <div className="flex flex-wrap justify-center gap-6">
                  {choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleMakeGuess(choice.id)}
                      disabled={loading}
                      className="group flex flex-col items-center gap-3 text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={choice.label}
                    >
                      <span
                        className={`flex h-36 w-24 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br ${choice.tone} text-4xl shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-focus-visible:-translate-y-1 group-focus-visible:shadow-lg`}
                      >
                        {choice.icon}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                        {choice.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {result && (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
                  <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                    Result
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      result.won ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {result.won ? "You won" : "You lost"}
                  </p>
                  <p className="text-sm text-slate-600">
                    Computer chose: {getChoiceName(result.choice)}
                  </p>
                  <button
                    onClick={() => {
                      setGameId(null);
                      setResult(null);
                    }}
                    className={subtleButton}
                  >
                    Play again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

        <footer className="rounded-xl bg-slate-50 px-5 py-4 text-xs leading-relaxed text-slate-500">
          {demoMode ? (
            <>
              <p className="font-medium text-slate-700">Demo mode active</p>
              <p className="mt-1">
                Zama Relayer is currently unavailable. Game continues with fallback mode.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-700">🔐 Fully Encrypted</p>
              <p className="mt-1">
                Powered by Zama FHEVM. Your moves are encrypted end-to-end with zero-knowledge proofs.
              </p>
            </>
          )}
        </footer>
      </section>
    </>
  );
}
