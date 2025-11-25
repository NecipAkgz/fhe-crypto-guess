import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface TutorialWizardModalProps {
  isVisible: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
  onSkip: () => void;
  onAction: (stepIndex: number) => void;
}

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

export const TutorialWizardModal = ({
  isVisible,
  onClose,
  onStartTutorial,
  onSkip,
  onAction
}: TutorialWizardModalProps) => {
  const [mounted, setMounted] = useState(false);

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
        className="mx-4 w-full max-w-2xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_50px_140px_-60px_rgba(15,23,42,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
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
                onClick={() => onAction(index)}
                className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-400"
              >
                {step.action}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Maybe Later
          </button>

          <div className="flex gap-2">
            <button
              onClick={onSkip}
              className="rounded-full border border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500"
            >
              Skip Tutorial
            </button>
            <button
              onClick={onStartTutorial}
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-400"
            >
              Start Learning! 📚
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
