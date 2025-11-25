"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CodeBlock } from "../shared/SyntaxHighlighter";
import type { FheEducationStep } from "@/lib/fheEducation";
import { getStageByKey } from "@/lib/fheStages";

interface FHEEducationModalProps {
  step: number;
  steps: FheEducationStep[];
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onSelectStep?: (step: number) => void;
  onOpenGlossary?: () => void;
}

const moveLabels = ["Rock", "Paper", "Scissors"];

const computerMove: number = 1; // Paper

const computeCipherPreview = (move: number) => {
  const pseudo = (move * 73 + 63) % 256;
  return `0x${pseudo.toString(16).padStart(2, "0")}`;
};

const determineOutcome = (player: number) => {
  if (player === computerMove) {
    return {
      label: "Draw",
      tone: "text-slate-200",
      explanation: "Both sides chose the same move and the ciphertext stays private on-chain.",
    };
  }

  const playerBeatsComputer =
    (player === 0 && computerMove === 2) ||
    (player === 1 && computerMove === 0) ||
    (player === 2 && computerMove === 1);

  return playerBeatsComputer
    ? {
        label: "You won",
        tone: "text-emerald-300",
        explanation: "The contract completed the homomorphic comparison in the player's favour.",
      }
    : {
        label: "You lost",
        tone: "text-rose-300",
        explanation: "The encrypted comparison ended with the computer winning—no plaintext leaked.",
      };
};

export const FHEEducationModal = ({
  step,
  steps,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onSelectStep,
  onOpenGlossary,
}: FHEEducationModalProps) => {
  const [playgroundInput, setPlaygroundInput] = useState("0");
  const [quizSelections, setQuizSelections] = useState<Record<number, number>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setPlaygroundInput("0");
    }
  }, [isVisible]);

  const totalSteps = steps.length;
  const safeIndex = Math.min(Math.max(step - 1, 0), Math.max(totalSteps - 1, 0));
  const currentStep = steps[safeIndex];

  const stageDetails = useMemo(() => {
    if (!currentStep?.stageKey) {
      return null;
    }

    try {
      return getStageByKey(currentStep.stageKey);
    } catch (error) {
      console.warn("Unknown FHE stage for education step", currentStep.stageKey, error);
      return null;
    }
  }, [currentStep]);

  const parsedMove = Number.parseInt(playgroundInput, 10);
  const isMoveValid = Number.isFinite(parsedMove) && parsedMove >= 0 && parsedMove <= 2;

  const cipherPreview = isMoveValid ? computeCipherPreview(parsedMove) : "0x??";
  const outcome = isMoveValid ? determineOutcome(parsedMove) : null;

  const currentQuiz = currentStep?.quiz;
  const selectedQuizIndex = currentQuiz ? quizSelections[currentStep.id] ?? -1 : -1;
  const selectedQuizOption = currentQuiz && selectedQuizIndex >= 0 ? currentQuiz.options[selectedQuizIndex] : null;

  const handleSelectQuizOption = (optionIndex: number) => {
    if (!currentQuiz) return;
    setQuizSelections((prev) => ({ ...prev, [currentStep.id]: optionIndex }));
  };

  const handleJumpToStep = (targetStep: number) => {
    onSelectStep?.(targetStep);
  };

  if (!isVisible || !currentStep || !mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-5xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_60px_140px_-60px_rgba(15,23,42,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/15 text-lg font-bold text-sky-200">
            {safeIndex + 1}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="text-xl font-semibold text-slate-100">{currentStep.title}</h3>
            <p className="text-sm text-slate-400">
              FHE Learning Module · Step {safeIndex + 1} of {totalSteps}
            </p>
          </div>
          {onOpenGlossary && (
            <button
              onClick={onOpenGlossary}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400/60 hover:text-emerald-50"
            >
              🧠 Browse glossary
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-3 py-1 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Close
          </button>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2">
          {steps.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleJumpToStep(index + 1)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                index === safeIndex
                  ? "border-sky-500/60 bg-sky-500/15 text-sky-100"
                  : "border-slate-800/60 bg-slate-900/40 text-slate-400 hover:border-sky-400/40 hover:text-sky-100"
              }`}
            >
              {index + 1}. {item.title.replace(/^[^\s]+\s/, "")}
            </button>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,1fr)]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5">
              {stageDetails && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
                  {stageDetails.icon} {stageDetails.label}
                </p>
              )}
              <p className="text-base font-medium text-slate-100 leading-relaxed">
                {currentStep.headline}
              </p>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {currentStep.codeSnippet && (
              <CodeBlock
                code={currentStep.codeSnippet.code}
                language={currentStep.codeSnippet.language as 'solidity' | 'typescript' | 'bash' | 'javascript'}
                title={currentStep.codeSnippet.title}
              />
            )}

            <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-5">
              <h4 className="mb-2 text-sm font-semibold text-sky-200">🎯 Key takeaway</h4>
              <p className="text-sm text-sky-100/90">{currentStep.keyTakeaway}</p>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-100">Mini Playground</p>
                <button
                  onClick={() => setPlaygroundInput("0")}
                  className="text-xs font-semibold text-emerald-200 underline-offset-2 hover:underline"
                >
                  Reset
                </button>
              </div>
              <label className="mb-3 flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
                Select your move (0-2)
                <input
                  value={playgroundInput}
                  onChange={(event) => setPlaygroundInput(event.target.value)}
                  className="rounded-lg border border-emerald-500/40 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-emerald-100 outline-none focus:border-emerald-300"
                  placeholder="0: Rock · 1: Paper · 2: Scissors"
                />
              </label>
              <div className="space-y-2 text-sm text-emerald-100/90">
                <p>
                  1️⃣ Plaintext: <span className="font-semibold text-emerald-50">
                    {isMoveValid ? `${parsedMove} (${moveLabels[parsedMove]})` : "Invalid input"}
                  </span>
                </p>
                <p>
                  2️⃣ Encrypted payload: <span className="font-semibold text-emerald-50">E({cipherPreview})</span>
                </p>
                <p>
                  3️⃣ Blind comparison: <span className="font-semibold text-emerald-50">
                    Computer = Paper (1)
                  </span>
                </p>
                <p>
                  4️⃣ Decryption result:
                  <span className={`ml-1 font-semibold ${outcome ? outcome.tone : "text-emerald-200"}`}>
                    {outcome ? outcome.label : "Enter a valid move first"}
                  </span>
                </p>
                {outcome && (
                  <p className="text-xs text-emerald-200/80">{outcome.explanation}</p>
                )}
              </div>
            </div>

            {currentQuiz && (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 p-5">
                <p className="text-sm font-semibold text-slate-100">Quick check</p>
                <p className="mt-2 text-sm text-slate-400">{currentQuiz.question}</p>
                <div className="mt-4 space-y-2">
                  {currentQuiz.options.map((option, index) => {
                    const isSelected = index === selectedQuizIndex;
                    const isCorrect = option.isCorrect;
                    return (
                      <button
                        key={option.label}
                        onClick={() => handleSelectQuizOption(index)}
                        className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? isCorrect
                              ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-100"
                              : "border-rose-500/60 bg-rose-500/15 text-rose-100"
                            : "border-slate-800/60 bg-slate-900/60 text-slate-300 hover:border-sky-400/40 hover:text-sky-100"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {selectedQuizOption && (
                  <p
                    className={`mt-3 text-xs ${
                      selectedQuizOption.isCorrect ? "text-emerald-200" : "text-rose-200"
                    }`}
                  >
                    {selectedQuizOption.helper ??
                      (selectedQuizOption.isCorrect
                        ? "Correct! You're ready for the next step."
                        : "Revisit the hints and try again.")}
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Step {safeIndex + 1} of {totalSteps}</span>
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleJumpToStep(index + 1)}
                  className={`h-2 w-2 rounded-full ${index === safeIndex ? "bg-sky-500" : "bg-slate-600"}`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasPrevious && onPrevious && (
              <button
                onClick={onPrevious}
                className="rounded-full border border-slate-800/70 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
              >
                ← Previous
              </button>
            )}
            {hasNext && onNext ? (
              <button
                onClick={onNext}
                className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-400"
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
        </footer>
      </div>
    </div>,
    document.body
  );
};
