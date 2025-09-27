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

  // Enhanced FHE Education states
  const [currentEducationStep, setCurrentEducationStep] = useState(0);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showTutorialWizard, setShowTutorialWizard] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

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
    if (currentEducationStep < educationSteps.length - 1) {
      setCurrentEducationStep(currentEducationStep + 1);
    }
  };

  const previousEducationStep = () => {
    if (currentEducationStep > 0) {
      setCurrentEducationStep(currentEducationStep - 1);
    }
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
        showEducation(0);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">🚀 FHEVM Development Tutorial</h2>
              <p className="text-slate-600">Your step-by-step guide to building privacy-preserving dApps</p>
            </div>

            <div className="space-y-4 mb-8">
              {tutorialSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                  <button
                    onClick={() => handleTutorialStep(index)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    {step.action}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowTutorialWizard(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Maybe Later
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTutorialWizard(false)}
                  className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={() => {
                    setShowTutorialWizard(false);
                    showEducation(0);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Start Learning! 📚
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white/90 p-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Play a round</h2>
              <p className="text-sm text-slate-500">
                Start an encrypted match and keep every move hidden from the contract.
              </p>
            </div>

            {/* Enhanced FHE Education Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowTutorialWizard(true)}
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                title="Complete tutorial wizard"
              >
                🚀 Full Tutorial
              </button>
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
