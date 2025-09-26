"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { startNewGame, makeGuess, getGameResult, checkServices } from "@/lib/game";
import { type ServiceStatus } from "@/lib/serviceStatus";
import { ethers } from "ethers";

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
      const provider = new ethers.BrowserProvider(window.ethereum);
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
      const provider = new ethers.BrowserProvider(window.ethereum);
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
    <section className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white/90 p-8">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">Play a round</h2>
        <p className="text-sm text-slate-500">
          Start an encrypted match and keep every move hidden from the contract.
        </p>
      </header>

      {serviceStatus && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            demoMode
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <p className="font-medium">{demoMode ? "Demo mode" : "Services online"}</p>
          <p className="mt-1 text-xs opacity-80">
            {demoMode
              ? "FHEVM service is offline; mock responses keep the flow available."
              : "All systems are operational. Moves stay encrypted throughout."}
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
              Real FHE execution is paused. Interactions mimic encrypted flow without the
              live service.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-slate-700">Encrypted end-to-end</p>
            <p className="mt-1">
              Inputs are sealed locally and never leave your device in plain text.
            </p>
          </>
        )}
      </footer>
    </section>
  );
}
