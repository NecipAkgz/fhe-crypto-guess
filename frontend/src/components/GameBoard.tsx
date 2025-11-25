"use client";

import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { useWallet } from "@/hooks/useWallet";
import { startNewGame, makeGuess, getGameResult, checkServices, type StageCallback } from "@/lib/game";
import { type ServiceStatus } from "@/lib/serviceStatus";
import { ethers } from "ethers";
import { FHEEducationModal } from './tutorial/FHEEducationModal';
import { EnvironmentSetupModal } from './tutorial/EnvironmentSetupModal';
import { SmartContractModal } from './tutorial/SmartContractModal';
import { FrontendIntegrationModal } from './tutorial/FrontendIntegrationModal';
import { DeploymentTestingModal } from './tutorial/DeploymentTestingModal';
import { GlossaryModal } from './tutorial/GlossaryModal';
import { TutorialWizardModal } from './tutorial/TutorialWizardModal';
import { FHE_PROGRESS_STAGES, getStageByKey, type FheStage, type FheStageKey } from "@/lib/fheStages";
import { FHE_EDUCATION_STEPS, FHE_GLOSSARY } from "@/lib/fheEducation";



// Encryption Progress Component
const EncryptionProgress = ({
  stages,
  activeStageKey,
}: {
  stages: FheStage[];
  activeStageKey: FheStageKey | null;
}) => {
  const totalSteps = stages.length;
  const activeIndex = activeStageKey
    ? stages.findIndex((stage) => stage.key === activeStageKey)
    : -1;
  const activeStage = activeIndex >= 0 ? stages[activeIndex] : null;

  return (
    <div className="mb-6 rounded-2xl border border-sky-500/20 bg-slate-950/40 p-5 backdrop-blur-md shadow-lg shadow-sky-900/5">
      <div className="mb-4 flex items-center justify-between text-xs text-slate-300">
        <h4 className="flex items-center gap-2 text-sm font-bold tracking-wide text-sky-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          Encryption Layer
        </h4>
        <span className="font-mono text-sky-400/80">
          {activeIndex >= 0
            ? `STEP ${activeIndex + 1}/${totalSteps}`
            : `READY`}
        </span>
      </div>

      <div className="mb-5 flex gap-1.5">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
              index <= activeIndex
                ? "bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                : "bg-slate-800/50"
            }`}
          />
        ))}
      </div>

      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900/50 text-lg border border-slate-800">
          {activeStage ? activeStage.icon : "🔒"}
        </div>
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current Process
          </div>
          <div className="text-sm font-medium text-slate-200 animate-fade-in">
            {activeStage ? activeStage.label : "Waiting for secure input..."}
          </div>
          {activeStage && (
            <p className="text-xs leading-relaxed text-slate-400 animate-slide-up">
              {activeStage.summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const StageTimeline = ({
  items,
  showFallbackNotice,
}: {
  items: FheStage[];
  showFallbackNotice: boolean;
}) => {
  if (items.length === 0 && !showFallbackNotice) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800/60 bg-slate-950/40 p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        <span className="text-lg">⚡</span>
        FHE Live Trace
      </div>

      <ul className="relative space-y-6 pl-2 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-20px)] before:w-px before:bg-slate-800/50">
        {items.map((stage, idx) => (
          <li key={stage.key} className="relative flex gap-4 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-lg shadow-sm ring-4 ring-slate-950">
              {stage.icon}
            </span>
            <div className="space-y-1.5 pt-1">
              <p className="font-semibold text-slate-100">{stage.label}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{stage.summary}</p>
              <div className="inline-block rounded bg-sky-500/10 px-2 py-1 text-[10px] font-medium text-sky-300 border border-sky-500/20">
                {stage.insight}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {showFallbackNotice && (
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          <span className="text-lg">⚠️</span>
          <p>FHE services were unreachable, so the app returned a deterministic demo result. Try again once the relayer is back to experience full encryption.</p>
        </div>
      )}
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

export type HowItWorksStep = {
  title: string;
  description: string;
};

export type GameBoardHandle = {
  startTutorial: () => void;
  showEducation: (step: number) => void;
  openEnvironmentModal: () => void;
  openContractModal: () => void;
  openFrontendModal: () => void;
  openDeploymentModal: () => void;
  openGlossaryModal: () => void;
};

const GameBoard = forwardRef<GameBoardHandle, { steps: HowItWorksStep[] }>(
  ({ steps: howItWorksSteps }, ref) => {
  const { address, isConnected, connectWallet } = useWallet();
  const [gameId, setGameId] = useState<number | null>(null);
  const [result, setResult] = useState<{won: boolean, choice: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  // Enhanced FHE Education states
  const [currentEducationStep, setCurrentEducationStep] = useState(1);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showTutorialWizard, setShowTutorialWizard] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [activeStageKey, setActiveStageKey] = useState<FheStageKey | null>(null);
  const [stageTimeline, setStageTimeline] = useState<FheStage[]>([]);
  const [educationPreviewStage, setEducationPreviewStage] = useState<FheStage | null>(null);
  const [isEducationPreview, setIsEducationPreview] = useState(false);


  // Tutorial modal states
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showFrontendModal, setShowFrontendModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [showGlossaryModal, setShowGlossaryModal] = useState(false);
  const [currentEnvStep, setCurrentEnvStep] = useState(1);
  const [currentContractStep, setCurrentContractStep] = useState(1);
  const [currentFrontendStep, setCurrentFrontendStep] = useState(1);
  const [currentDeploymentStep, setCurrentDeploymentStep] = useState(1);

  // Tutorial wizard for first-time users


  const applyEducationPreview = useCallback((stepNumber: number) => {
    const stepData = FHE_EDUCATION_STEPS[stepNumber - 1];

    if (!stepData) {
      setEducationPreviewStage(null);
      setIsEducationPreview(false);
      return;
    }

    if (stepData.stageKey) {
      const stage = getStageByKey(stepData.stageKey);
      setEducationPreviewStage(stage);
      setActiveStageKey(stage.key);
      setShowProgress(true);
    } else {
      setEducationPreviewStage(null);
      if (stageTimeline.length > 0) {
        const lastStage = stageTimeline[stageTimeline.length - 1];
        if (lastStage.isProgress) {
          setActiveStageKey(lastStage.key);
        }
        setShowProgress(true);
      } else {
        setActiveStageKey(null);
        setShowProgress(false);
      }
    }

    setIsEducationPreview(true);
  }, [stageTimeline]);

  const clearEducationPreview = useCallback(() => {
    setIsEducationPreview(false);
    setEducationPreviewStage(null);

    if (stageTimeline.length > 0) {
      const lastStage = stageTimeline[stageTimeline.length - 1];
      if (lastStage.isProgress) {
        setActiveStageKey(lastStage.key);
        setShowProgress(true);
      }
    } else {
      setActiveStageKey(null);
      setShowProgress(false);
    }
  }, [stageTimeline]);

  // Show education modal with navigation
  const handleCloseEducationModal = useCallback(() => {
    setShowEducationModal(false);
    clearEducationPreview();
  }, [clearEducationPreview]);

  const closeGlossaryModal = useCallback(() => {
    setShowGlossaryModal(false);
  }, []);

  const showEducation = (step: number) => {
    const safeStep = Math.min(Math.max(step, 1), FHE_EDUCATION_STEPS.length);
    setCurrentEducationStep(safeStep);
    setShowEducationModal(true);
    applyEducationPreview(safeStep);
  };

  // Navigate education steps
  const nextEducationStep = () => {
    setCurrentEducationStep((prev) => {
      const nextStep = Math.min(prev + 1, FHE_EDUCATION_STEPS.length);
      applyEducationPreview(nextStep);
      return nextStep;
    });
  };

  const previousEducationStep = () => {
    setCurrentEducationStep((prev) => {
      const nextStep = Math.max(prev - 1, 1);
      applyEducationPreview(nextStep);
      return nextStep;
    });
  };

  // Start tutorial wizard
  const startTutorial = () => {
    setShowTutorialWizard(true);
    setShowEducationModal(false);
    clearEducationPreview();
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

  useImperativeHandle(ref, () => ({
    startTutorial,
    showEducation,
    openEnvironmentModal: () => setShowEnvironmentModal(true),
    openContractModal: () => setShowContractModal(true),
    openFrontendModal: () => setShowFrontendModal(true),
    openDeploymentModal: () => setShowDeploymentModal(true),
    openGlossaryModal: () => setShowGlossaryModal(true),
  }));

  const resetStageProgress = useCallback(() => {
    setActiveStageKey(null);
    setStageTimeline([]);
    setEducationPreviewStage(null);
    setIsEducationPreview(false);
    setShowProgress(false);
    setSelectedChoice(null);
  }, []);

  const handleStageEvent: StageCallback = useCallback((stage: FheStage) => {
    setEducationPreviewStage(null);
    setIsEducationPreview(false);

    setStageTimeline((prev) => {
      if (prev.some((item) => item.key === stage.key)) {
        return prev;
      }

      const next = [...prev, stage];
      return next.sort((a, b) => a.order - b.order);
    });

    if (stage.isProgress) {
      setActiveStageKey(stage.key);
      setShowProgress(true);
    }
  }, []);

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

  // Hydration fix: Ensure consistent rendering between server and client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isEducationPreview) {
      return undefined;
    }

    if (activeStageKey === "decrypt-output") {
      // Keep the progress indicator on screen; let players dismiss it after reviewing the result
      // const timeout = setTimeout(() => {
      //   setShowProgress(false);
      // }, 900);
    }

    return undefined;
  }, [activeStageKey, isEducationPreview]);

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
      // Hard-coded demo value; normally derive from the transaction receipt
      setGameId(1);
      resetStageProgress();
      setShowProgress(false);
      setResult(null);
    } catch (error) {
      console.error("Error starting game:", error);
      alert("Error starting game. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMakeGuess = async (choice: number) => {
    if (!gameId || loading || selectedChoice !== null || result !== null) {
      return;
    }

    // Capture the first choice so repeat clicks are ignored while processing
    setSelectedChoice(choice);
    setLoading(true);
    resetStageProgress();
    setShowProgress(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      await makeGuess(signer, gameId, choice, handleStageEvent);

      const gameResult = await getGameResult(signer, gameId, handleStageEvent);
      setResult(gameResult);
    } catch (error) {
      console.error("Error making guess:", error);
      alert("Error making guess. Please try again.");
      // Allow another attempt by clearing the selection
      setSelectedChoice(null);
      setShowProgress(false);
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
        steps={FHE_EDUCATION_STEPS}
        isVisible={showEducationModal}
        onClose={handleCloseEducationModal}
        onNext={currentEducationStep < FHE_EDUCATION_STEPS.length ? nextEducationStep : undefined}
        onPrevious={currentEducationStep > 1 ? previousEducationStep : undefined}
        hasNext={currentEducationStep < FHE_EDUCATION_STEPS.length}
        hasPrevious={currentEducationStep > 1}
        onSelectStep={showEducation}
        onOpenGlossary={() => setShowGlossaryModal(true)}
      />

      <GlossaryModal
        isVisible={showGlossaryModal}
        onClose={closeGlossaryModal}
        entries={FHE_GLOSSARY}
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
      <TutorialWizardModal
        isVisible={showTutorialWizard}
        onClose={() => setShowTutorialWizard(false)}
        onStartTutorial={() => {
          setShowTutorialWizard(false);
          showEducation(1);
        }}
        onSkip={() => setShowTutorialWizard(false)}
        onAction={handleTutorialStep}
      />

      <section className="flex w-full flex-col gap-4 rounded-2xl border border-slate-800/60 bg-slate-950/70 p-4 shadow-[0_40px_90px_-60px_rgba(15,23,42,0.9)] backdrop-blur-xl">
        <header className="space-y-3">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100 sm:text-xl">
              How it works
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <div key={step.title} className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800/70 text-xs font-semibold text-slate-200">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-200">{step.title}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {(showProgress || stageTimeline.length > 0) && (
            <div className="space-y-4">
              {showProgress && (
                <EncryptionProgress
                  stages={FHE_PROGRESS_STAGES}
                  activeStageKey={activeStageKey}
                />
              )}
              <StageTimeline
                items={educationPreviewStage ? [educationPreviewStage] : stageTimeline}
                showFallbackNotice={false}
              />
            </div>
          )}
        </header>

        {isClient && serviceStatus && (
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
                        disabled={loading || result !== null}
                        className={`group relative flex flex-col items-center gap-4 rounded-3xl border p-6 transition-all duration-300 ${
                          selectedChoice === choice.id
                            ? "border-sky-500 bg-sky-500/10 scale-105 shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                            : "border-slate-800 bg-slate-900/40 hover:border-sky-500/50 hover:bg-slate-800 hover:-translate-y-1 hover:shadow-xl"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <div className={`flex h-32 w-full items-center justify-center rounded-2xl bg-gradient-to-br ${choice.tone} text-6xl shadow-inner`}>
                          <span className="group-hover:scale-110 transition-transform duration-300 filter drop-shadow-lg">
                            {choice.icon}
                          </span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-200">
                          {choice.label}
                        </span>

                        {selectedChoice === choice.id && (
                          <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg animate-bounce">
                            ✓
                          </div>
                        )}
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
                        setSelectedChoice(null);
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
          {isClient && demoMode ? (
            <>
              <p className="font-semibold text-amber-200">Demo mode active</p>
              <p className="mt-1">
                Zama Relayer is currently unavailable. We are simulating encrypted responses for you to explore the flow.
              </p>
            </>
          ) : (
            isClient && (
              <>
                <p className="font-semibold text-sky-200">🔐 Fully encrypted</p>
                <p className="mt-1">
                  Powered by Zama FHEVM. Your ciphertext never leaves the privacy boundary while consensus stays transparent.
                </p>
              </>
            )
          )}
        </footer>
      </section>
    </>
  );
  }
);

GameBoard.displayName = "GameBoard";

export default GameBoard;
