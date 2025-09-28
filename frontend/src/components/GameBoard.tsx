"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { startNewGame, makeGuess, getGameResult, checkServices } from "@/lib/game";
import { type ServiceStatus } from "@/lib/serviceStatus";
import { ethers } from "ethers";
import { FHEEducationModal } from './tutorial/FHEEducationModal';
import { EnvironmentSetupModal } from './tutorial/EnvironmentSetupModal';
import { SmartContractModal } from './tutorial/SmartContractModal';
import { FrontendIntegrationModal } from './tutorial/FrontendIntegrationModal';
import { DeploymentTestingModal } from './tutorial/DeploymentTestingModal';



// Encryption Progress Component
const EncryptionProgress = ({
  currentStep,
  totalSteps
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="mb-6 rounded-2xl border border-sky-400/40 bg-slate-950/40 p-4 backdrop-blur">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
        <h4 className="text-sm font-semibold tracking-wide text-sky-200">
          Encryption progress
        </h4>
        <span>
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors duration-500 ${
              i < currentStep ? "bg-gradient-to-r from-sky-400 to-cyan-400" : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      <div className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">
        {currentStep === 1 && "🔐 Generating encryption keys"}
        {currentStep === 2 && "📝 Encrypting your choice"}
        {currentStep === 3 && "⛓️ Broadcasting ciphertext"}
        {currentStep === 4 && "🔍 Computing result blindly"}
        {currentStep === 5 && "🔓 Decrypting outcome locally"}
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
  { id: 0, label: "Rock", icon: "🪨", tone: "from-slate-950 via-slate-900 to-slate-800" },
  { id: 1, label: "Paper", icon: "📄", tone: "from-sky-500/20 via-slate-950 to-slate-900" },
  { id: 2, label: "Scissors", icon: "✂️", tone: "from-rose-500/25 via-slate-950 to-slate-900" },
];

export default function GameBoard() {
  const { address, isConnected, connectWallet } = useWallet();
  const [gameId, setGameId] = useState<number | null>(null);
  const [result, setResult] = useState<{won: boolean, choice: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Enhanced FHE Education states
  const [currentEducationStep, setCurrentEducationStep] = useState(1);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showTutorialWizard, setShowTutorialWizard] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // Tutorial modal states
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showFrontendModal, setShowFrontendModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [currentEnvStep, setCurrentEnvStep] = useState(1);
  const [currentContractStep, setCurrentContractStep] = useState(1);
  const [currentFrontendStep, setCurrentFrontendStep] = useState(1);
  const [currentDeploymentStep, setCurrentDeploymentStep] = useState(1);

  // Enhanced FHE Education content with more depth
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

  // Tutorial wizard for first-time users
  const tutorialSteps = [
    {
      title: "Welcome to FHEVM Development! 🚀",
      description: "You're about to build your first privacy-preserving dApp. This interactive tutorial will guide you through the process step by step.",
      action: "Start Tutorial"
    },
    {
      title: "Set Up Your Development Environment",
      description: "We'll help you configure Hardhat, install FHEVM dependencies, and prepare your wallet for encrypted transactions.",
      action: "Configure Environment"
    },
    {
      title: "Write Your First FHE Smart Contract",
      description: "Learn to use encrypted data types (euint32, ebool) and FHE operations in your Solidity contracts.",
      action: "Write Contract"
    },
    {
      title: "Build the Frontend Interface",
      description: "Create a React interface that handles encryption, wallet connections, and user interactions.",
      action: "Build Frontend"
    },
    {
      title: "Deploy and Test Your dApp",
      description: "Deploy to testnet, run comprehensive tests, and verify everything works as expected.",
      action: "Deploy & Test"
    }
  ];

  // Show education modal with navigation
  const showEducation = (step: number) => {
    setCurrentEducationStep(step);
    setShowEducationModal(true);
  };

  // Navigate education steps
  const nextEducationStep = () => {
    setCurrentEducationStep((prev) => Math.min(prev + 1, educationSteps.length));
  };

  const previousEducationStep = () => {
    setCurrentEducationStep((prev) => Math.max(prev - 1, 1));
  };

  // Start tutorial wizard
  const startTutorial = () => {
    setShowTutorialWizard(true);
    setShowEducationModal(false);
  };

  // Handle tutorial step actions
  const handleTutorialStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start Tutorial
        setShowTutorialWizard(false);
        showEducation(1);
        break;
      case 1: // Configure Environment
        setShowTutorialWizard(false);
        setCurrentEnvStep(1);
        setShowEnvironmentModal(true);
        break;
      case 2: // Write Contract
        setShowTutorialWizard(false);
        setCurrentContractStep(1);
        setShowContractModal(true);
        break;
      case 3: // Build Frontend
        setShowTutorialWizard(false);
        setCurrentFrontendStep(1);
        setShowFrontendModal(true);
        break;
      case 4: // Deploy & Test
        setShowTutorialWizard(false);
        setCurrentDeploymentStep(1);
        setShowDeploymentModal(true);
        break;
      default:
        break;
    }
  };

  // Environment modal navigation
  const nextEnvStep = () => {
    if (currentEnvStep < 4) {
      setCurrentEnvStep(currentEnvStep + 1);
    }
  };

  const prevEnvStep = () => {
    if (currentEnvStep > 1) {
      setCurrentEnvStep(currentEnvStep - 1);
    }
  };

  // Contract modal navigation
  const nextContractStep = () => {
    if (currentContractStep < 4) {
      setCurrentContractStep(currentContractStep + 1);
    }
  };

  const prevContractStep = () => {
    if (currentContractStep > 1) {
      setCurrentContractStep(currentContractStep - 1);
    }
  };

  // Frontend modal navigation
  const nextFrontendStep = () => {
    if (currentFrontendStep < 4) {
      setCurrentFrontendStep(currentFrontendStep + 1);
    }
  };

  const prevFrontendStep = () => {
    if (currentFrontendStep > 1) {
      setCurrentFrontendStep(currentFrontendStep - 1);
    }
  };

  // Deployment modal navigation
  const nextDeploymentStep = () => {
    if (currentDeploymentStep < 4) {
      setCurrentDeploymentStep(currentDeploymentStep + 1);
    }
  };

  const prevDeploymentStep = () => {
    if (currentDeploymentStep > 1) {
      setCurrentDeploymentStep(currentDeploymentStep - 1);
    }
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

      await startNewGame(signer);
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
    void simulateEncryption();
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
    "w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-200 hover:-translate-y-0.5 hover:from-sky-400 hover:to-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-60";
  const subtleButton =
    "rounded-full border border-slate-700/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-400/50 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <>


      <FHEEducationModal
        step={currentEducationStep}
        isVisible={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        onNext={currentEducationStep < educationSteps.length ? nextEducationStep : undefined}
        onPrevious={currentEducationStep > 1 ? previousEducationStep : undefined}
        hasNext={currentEducationStep < educationSteps.length}
        hasPrevious={currentEducationStep > 1}
      />

      {/* Environment Setup Modal */}
      <EnvironmentSetupModal
        step={currentEnvStep}
        isVisible={showEnvironmentModal}
        onClose={() => setShowEnvironmentModal(false)}
        onNext={nextEnvStep}
        onPrevious={prevEnvStep}
        hasNext={currentEnvStep < 4}
        hasPrevious={currentEnvStep > 1}
      />

      {/* Smart Contract Development Modal */}
      <SmartContractModal
        step={currentContractStep}
        isVisible={showContractModal}
        onClose={() => setShowContractModal(false)}
        onNext={nextContractStep}
        onPrevious={prevContractStep}
        hasNext={currentContractStep < 4}
        hasPrevious={currentContractStep > 1}
      />

      {/* Frontend Integration Modal */}
      <FrontendIntegrationModal
        step={currentFrontendStep}
        isVisible={showFrontendModal}
        onClose={() => setShowFrontendModal(false)}
        onNext={nextFrontendStep}
        onPrevious={prevFrontendStep}
        hasNext={currentFrontendStep < 4}
        hasPrevious={currentFrontendStep > 1}
      />

      {/* Deployment and Testing Modal */}
      <DeploymentTestingModal
        step={currentDeploymentStep}
        isVisible={showDeploymentModal}
        onClose={() => setShowDeploymentModal(false)}
        onNext={nextDeploymentStep}
        onPrevious={prevDeploymentStep}
        hasNext={currentDeploymentStep < 4}
        hasPrevious={currentDeploymentStep > 1}
      />

      {/* Tutorial Wizard Component */}
      {showTutorialWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="mx-4 w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_50px_140px_-60px_rgba(15,23,42,0.9)]">
            <div className="mb-6 text-center">
              <h2 className="mb-2 text-2xl font-semibold text-slate-100">🚀 FHEVM Development Tutorial</h2>
              <p className="text-sm text-slate-400">Your step-by-step guide to building privacy-preserving dApps</p>
            </div>

            <div className="space-y-4 mb-8">
              {tutorialSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-4 transition hover:border-sky-400/50 hover:bg-slate-900/60"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/15 text-sm font-bold text-sky-200">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-100">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>
                  <button
                    onClick={() => handleTutorialStep(index)}
                    className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-400"
                  >
                    {step.action}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowTutorialWizard(false)}
                className="rounded-full border border-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
              >
                Maybe Later
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTutorialWizard(false)}
                  className="rounded-full border border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={() => {
                    setShowTutorialWizard(false);
                    showEducation(1);
                  }}
                  className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-400"
                >
                  Start Learning! 📚
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="flex w-full flex-col gap-8 rounded-3xl border border-slate-800/60 bg-slate-950/70 p-10 shadow-[0_40px_90px_-60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
        <header className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
            <div className="space-y-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.45em] text-sky-200">
                Match console
              </span>
              <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
                Run encrypted rounds in sync with the guide
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate-400">
                Start a session, make a move, and watch the encryption progress bar track each step the sidebar explains. Everything stays private, yet the experience remains auditable.
              </p>
            </div>

            <div className="flex w-full flex-col gap-5 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-5 text-left">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Quick onboarding
                </p>
                <p className="text-sm text-slate-300">
                  Get oriented fast, then dive straight into encrypted play.
                </p>
              </div>

              <div className="grid gap-2">
                <button
                  onClick={startTutorial}
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400"
                >
                  🚀 Launch interactive tutorial
                </button>
                <button
                  onClick={() => showEducation(1)}
                  className="rounded-lg border border-slate-700/70 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-sky-400/50 hover:text-sky-200"
                >
                  📚 FHE essentials (3 steps)
                </button>
              </div>

              <div className="flex flex-col gap-2 text-xs text-slate-300">
                <p className="uppercase tracking-[0.35em] text-slate-500">Deep dive modules</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowEnvironmentModal(true)}
                    className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                  >
                    Environment setup
                  </button>
                  <button
                    onClick={() => setShowContractModal(true)}
                    className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                  >
                    Smart contract
                  </button>
                  <button
                    onClick={() => setShowFrontendModal(true)}
                    className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                  >
                    Frontend integration
                  </button>
                  <button
                    onClick={() => setShowDeploymentModal(true)}
                    className="rounded-lg border border-slate-700/70 px-3 py-2 font-semibold transition hover:border-sky-400/50 hover:text-sky-200"
                  >
                    Deploy & test
                  </button>
                </div>
              </div>
            </div>
          </div>

          {showProgress && (
            <EncryptionProgress currentStep={encryptionProgress} totalSteps={5} />
          )}
        </header>

        {serviceStatus && (
          <div
            className={`rounded-2xl border px-5 py-4 text-sm backdrop-blur ${
              demoMode
                ? "border-amber-500/40 bg-amber-500/15 text-amber-100"
                : "border-emerald-500/35 bg-emerald-500/15 text-emerald-100"
            }`}
          >
            <p className="font-semibold uppercase tracking-[0.25em]">
              {demoMode ? "Demo mode" : "FHEVM ready"}
            </p>
            <p className="mt-2 text-xs leading-relaxed opacity-80">
              {demoMode
                ? "Relayer service unavailable. Switching to deterministic mock flow so you can still explore the UX."
                : "Zama Relayer is online. Every transaction flows through encrypted rails with verifiable proofs."}
            </p>
          </div>
        )}

        {!isConnected ? (
          <div className="flex flex-col gap-5 rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/40 px-6 py-10 text-center">
            <p className="text-sm text-slate-400">
              Connect your wallet to begin.
            </p>
            <button onClick={connectWallet} className={primaryButton}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-900/50 px-5 py-4 text-xs text-slate-400">
              <span>Connected</span>
              <span className="font-semibold text-slate-200">
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
                <div className="space-y-4 text-center">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                    Make your move
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleMakeGuess(choice.id)}
                        disabled={loading}
                        className="group flex flex-col items-center gap-3 rounded-3xl border border-slate-800/70 bg-slate-900/50 p-4 text-slate-300 transition hover:border-sky-400/50 hover:text-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={choice.label}
                      >
                        <span
                          className={`flex h-32 w-28 items-center justify-center rounded-2xl border border-slate-800/80 bg-gradient-to-br ${choice.tone} text-4xl shadow-[0_25px_40px_-20px_rgba(14,21,40,0.9)] transition-transform duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_35px_55px_-25px_rgba(56,189,248,0.45)]`}
                        >
                          {choice.icon}
                        </span>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">
                          {choice.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {result && (
                  <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 px-6 py-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                      Result
                    </p>
                    <p
                      className={`text-lg font-semibold ${
                        result.won ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      {result.won ? "You won" : "You lost"}
                    </p>
                    <p className="text-sm text-slate-400">
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

        <footer className="rounded-2xl border border-slate-800/70 bg-slate-900/60 px-6 py-5 text-xs leading-relaxed text-slate-400">
          {demoMode ? (
            <>
              <p className="font-semibold text-amber-200">Demo mode active</p>
              <p className="mt-1">
                Zama Relayer is currently unavailable. We are simulating encrypted responses for you to explore the flow.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-sky-200">🔐 Fully encrypted</p>
              <p className="mt-1">
                Powered by Zama FHEVM. Your ciphertext never leaves the privacy boundary while consensus stays transparent.
              </p>
            </>
          )}
        </footer>
      </section>
    </>
  );
}
