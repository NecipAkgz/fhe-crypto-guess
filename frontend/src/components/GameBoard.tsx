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
import { FHEPlaygroundModal } from './tutorial/FHEPlaygroundModal';
import { SecurityModal } from './tutorial/SecurityModal';
import { GasAnalyzerModal } from './tutorial/GasAnalyzerModal';
import { UseCaseGalleryModal } from './tutorial/UseCaseGalleryModal';
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
    <div className="mb-6 rounded-xl border border-slate-800 bg-black/60 p-5 backdrop-blur-md relative overflow-hidden">
      {/* Scanning line effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent animate-scan pointer-events-none"></div>

      <div className="mb-4 flex items-center justify-between text-xs font-mono">
        <h4 className="flex items-center gap-2 font-bold tracking-widest text-sky-400 uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          Encryption_Module
        </h4>
        <span className="text-slate-500">
          {activeIndex >= 0
            ? `[STEP_${activeIndex + 1}/${totalSteps}]`
            : `[STANDBY]`}
        </span>
      </div>

      <div className="mb-5 flex gap-1">
        {stages.map((stage, index) => (
          <div
            key={stage.key}
            className={`h-1 flex-1 transition-all duration-500 ${
              index <= activeIndex
                ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]"
                : "bg-slate-800"
            }`}
          />
        ))}
      </div>

      <div className="flex items-start gap-4 relative z-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-900 border border-slate-700 text-xl shadow-inner text-sky-300">
          {activeStage ? activeStage.icon : "🔒"}
        </div>
        <div className="space-y-1 font-mono">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Current_Process
          </div>
          <div className="text-sm font-bold text-slate-200 animate-fade-in">
            {activeStage ? activeStage.label : "Waiting for secure input..."}
          </div>
          {activeStage && (
            <p className="text-xs leading-relaxed text-slate-400 animate-slide-up font-sans">
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
    <div className="rounded-xl border border-slate-800 bg-black/40 p-4 font-mono text-xs backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2 text-slate-500">
        <span className="text-emerald-500">➜</span>
        <span className="uppercase tracking-widest">FHE_Trace_Log.exe</span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {items.map((stage, idx) => (
          <div key={stage.key} className="relative pl-4 animate-fade-in border-l border-slate-800" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="absolute left-0 top-1.5 h-1.5 w-1.5 -translate-x-[3.5px] rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-300">[{new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                <span className="font-bold text-slate-200">{stage.label}</span>
              </div>
              <p className="text-slate-400 opacity-80 pl-[85px]">{stage.summary}</p>
              {stage.insight && (
                 <div className="ml-[85px] mt-1 inline-block text-emerald-400/90">
                   {`>> ${stage.insight}`}
                 </div>
              )}
            </div>
          </div>
        ))}

        {showFallbackNotice && (
          <div className="mt-4 border-l-2 border-amber-500 pl-4 text-amber-200">
            <span className="font-bold bg-amber-500/20 px-1">WARNING</span> Relayer unavailable. Using deterministic mock.
          </div>
        )}

        <div className="animate-pulse text-sky-500 font-bold mt-2">_</div>
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

export type GameBoardHandle = {
  startTutorial: () => void;
  showEducation: (step: number) => void;
  openEnvironmentModal: () => void;
  openContractModal: () => void;
  openFrontendModal: () => void;
  openDeploymentModal: () => void;
  openGlossaryModal: () => void;
  openPlaygroundModal: () => void;
  openSecurityModal: () => void;
  openGasAnalyzerModal: () => void;
  openUseCaseGalleryModal: () => void;
};

const GameBoard = forwardRef<GameBoardHandle, unknown>(
  (_props, ref) => {
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

  // New Education Modals
  const [showPlaygroundModal, setShowPlaygroundModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showGasAnalyzerModal, setShowGasAnalyzerModal] = useState(false);
  const [showUseCaseGalleryModal, setShowUseCaseGalleryModal] = useState(false);

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
    openPlaygroundModal: () => setShowPlaygroundModal(true),
    openSecurityModal: () => setShowSecurityModal(true),
    openGasAnalyzerModal: () => setShowGasAnalyzerModal(true),
    openUseCaseGalleryModal: () => setShowUseCaseGalleryModal(true),
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
    setLoading(true);
    resetStageProgress();
    setSelectedChoice(choice);
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

      <EnvironmentSetupModal
        step={currentEnvStep}
        isVisible={showEnvironmentModal}
        onClose={() => setShowEnvironmentModal(false)}
        onNext={nextEnvStep}
        onPrevious={prevEnvStep}
        hasNext={currentEnvStep < 4}
        hasPrevious={currentEnvStep > 1}
      />

      <SmartContractModal
        step={currentContractStep}
        isVisible={showContractModal}
        onClose={() => setShowContractModal(false)}
        onNext={nextContractStep}
        onPrevious={prevContractStep}
        hasNext={currentContractStep < 4}
        hasPrevious={currentContractStep > 1}
      />

      <FrontendIntegrationModal
        step={currentFrontendStep}
        isVisible={showFrontendModal}
        onClose={() => setShowFrontendModal(false)}
        onNext={nextFrontendStep}
        onPrevious={prevFrontendStep}
        hasNext={currentFrontendStep < 4}
        hasPrevious={currentFrontendStep > 1}
      />

      <DeploymentTestingModal
        step={currentDeploymentStep}
        isVisible={showDeploymentModal}
        onClose={() => setShowDeploymentModal(false)}
        onNext={nextDeploymentStep}
        onPrevious={prevDeploymentStep}
        hasNext={currentDeploymentStep < 4}
        hasPrevious={currentDeploymentStep > 1}
      />

      <FHEPlaygroundModal
        isVisible={showPlaygroundModal}
        onClose={() => setShowPlaygroundModal(false)}
      />
      <SecurityModal
        isVisible={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />
      <GasAnalyzerModal
        isVisible={showGasAnalyzerModal}
        onClose={() => setShowGasAnalyzerModal(false)}
      />
      <UseCaseGalleryModal
        isVisible={showUseCaseGalleryModal}
        onClose={() => setShowUseCaseGalleryModal(false)}
      />

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

      {/* Main Game Console */}
      <section className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-[0_0_50px_-10px_rgba(14,165,233,0.15)] backdrop-blur-2xl">
        {/* Top Status Bar / Stepper */}
        <div className="border-b border-slate-800/60 bg-slate-900/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">System Online</span>
            </div>
            {isClient && serviceStatus && (
               <div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold ${demoMode ? "text-amber-400" : "text-emerald-400"}`}>
                 <span>{demoMode ? "⚠️ Demo Mode" : "⚡ FHEVM Network"}</span>
               </div>
            )}
          </div>

          {/* Dynamic Stepper */}
          <div className="mt-6 flex justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 z-0"></div>

            {[
              { id: 1, label: "Connect", active: !isConnected, completed: isConnected },
              { id: 2, label: "Initialize", active: isConnected && !gameId, completed: !!gameId },
              { id: 3, label: "Encrypt Move", active: !!gameId && !selectedChoice, completed: !!selectedChoice },
              { id: 4, label: "Decrypt", active: !!selectedChoice && !result, completed: !!result }
            ].map((step, idx) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 px-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                    step.completed
                      ? "bg-emerald-500 border-emerald-500 text-slate-950 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : step.active
                        ? "bg-slate-900 border-sky-500 text-sky-400 scale-110 shadow-[0_0_15px_rgba(14,165,233,0.4)] animate-pulse"
                        : "bg-slate-900 border-slate-700 text-slate-600"
                  }`}
                >
                  {step.completed ? "✓" : step.id}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  step.active || step.completed ? "text-slate-200" : "text-slate-600"
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6 sm:p-8">
          {/* FHE Visualization Layer (Conditional) */}
          {(showProgress || stageTimeline.length > 0) && (
            <div className="mb-8 space-y-6 animate-fade-in">
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

          {/* Game Interaction Layer */}
          <div className="relative min-h-[300px] flex flex-col items-center justify-center">
            {!isConnected ? (
              <div className="text-center space-y-6 max-w-md animate-fade-in">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl shadow-inner">
                  🔌
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-100">Connect to Play</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Link your wallet to generate your unique FHE keys.
                    Your keys never leave your device, ensuring total privacy.
                  </p>
                </div>
                <button onClick={connectWallet} className={primaryButton}>
                  Connect Wallet
                </button>
              </div>
            ) : !gameId ? (
              <div className="text-center space-y-6 max-w-md animate-slide-up">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl shadow-inner">
                  🎲
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-100">Ready to Start</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Initialize a new encrypted game session.
                    The contract will generate a random move without revealing it.
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  disabled={loading}
                  className={primaryButton}
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Initializing...
                    </span>
                  ) : "Start New Game"}
                </button>
              </div>
            ) : (
              <div className="w-full animate-slide-up">
                <div className="text-center mb-8">
                  <h3 className="text-sm font-bold text-sky-400 uppercase tracking-[0.2em] mb-2">
                    Select Your Move
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Your choice will be encrypted locally before sending.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                  {choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleMakeGuess(choice.id)}
                      disabled={loading || result !== null}
                      className={`group relative flex flex-col items-center gap-4 rounded-3xl border p-1 transition-all duration-300 ${
                        selectedChoice === choice.id
                          ? "border-sky-500 scale-105 z-10"
                          : "border-slate-800 hover:border-sky-500/50 hover:-translate-y-1"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <div className={`w-full h-full rounded-[20px] p-6 flex flex-col items-center gap-4 bg-slate-950 relative overflow-hidden`}>
                         <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${choice.tone}`}></div>

                         <div className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${choice.tone} text-5xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                           {choice.icon}
                         </div>
                         <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-200">
                           {choice.label}
                         </span>
                      </div>

                      {selectedChoice === choice.id && (
                        <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/40 animate-bounce font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {result && (
                  <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/80 p-8 text-center animate-fade-in">
                    <div className={`absolute inset-0 opacity-20 ${result.won ? "bg-emerald-500" : "bg-rose-500"}`}></div>

                    <div className="relative z-10 space-y-4">
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-950 border border-slate-800 shadow-xl mb-2">
                        <span className="text-3xl">{result.won ? "🏆" : "💀"}</span>
                      </div>

                      <div>
                        <h4 className={`text-3xl font-bold ${result.won ? "text-emerald-300" : "text-rose-300"}`}>
                          {result.won ? "YOU WON!" : "YOU LOST"}
                        </h4>
                        <p className="text-slate-400 text-sm mt-2">
                          Computer chose <span className="text-slate-200 font-bold">{getChoiceName(result.choice)}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setGameId(null);
                          setResult(null);
                          setSelectedChoice(null);
                        }}
                        className="mt-4 px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-colors border border-slate-700 hover:border-slate-600"
                      >
                        Play Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-slate-800/60 bg-slate-950/50 px-6 py-4 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span>🔒 End-to-End Encrypted</span>
            <span className="h-3 w-px bg-slate-800"></span>
            <span>🛡️ Verifiable</span>
          </div>
          <div>
            Powered by <span className="text-slate-400 font-bold">Zama FHEVM</span>
          </div>
        </div>
      </section>
    </>
  );
  }
);

GameBoard.displayName = "GameBoard";

export default GameBoard;
