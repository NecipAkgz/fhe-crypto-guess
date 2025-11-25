import { useState, useEffect } from "react";
import { createPortal } from "react-dom";


interface FHEPlaygroundModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const FHEPlaygroundModal = ({ isVisible, onClose }: FHEPlaygroundModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [inputA, setInputA] = useState<number>(5);
  const [inputB, setInputB] = useState<number>(3);
  const [operation, setOperation] = useState<"add" | "mul" | "sub">("add");
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isComputed, setIsComputed] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isVisible) {
      resetState();
    }
  }, [isVisible]);

  const resetState = () => {
    setIsEncrypted(false);
    setIsComputed(false);
    setIsDecrypted(false);
    setLogs([]);
  };

  const addLog = (msg: string) => setLogs((prev) => [...prev, `> ${msg}`]);

  const handleEncrypt = () => {
    setIsEncrypted(true);
    addLog(`Encrypting Input A (${inputA}) -> 0x${Math.random().toString(16).slice(2, 10)}...`);
    addLog(`Encrypting Input B (${inputB}) -> 0x${Math.random().toString(16).slice(2, 10)}...`);
  };

  const handleCompute = () => {
    setIsComputed(true);
    addLog(`Computing: E(A) ${operation === "add" ? "+" : operation === "mul" ? "×" : "-"} E(B)...`);
    addLog(`Result Handle: 0x${Math.random().toString(16).slice(2, 10)}...`);
    addLog(`Noise Budget: Consumed ~${operation === "mul" ? "15" : "5"}%`);
  };

  const handleDecrypt = () => {
    setIsDecrypted(true);
    let res = 0;
    if (operation === "add") res = inputA + inputB;
    if (operation === "mul") res = inputA * inputB;
    if (operation === "sub") res = inputA - inputB;
    addLog(`Decrypting result with Secret Key...`);
    addLog(`Plaintext Result: ${res}`);
  };

  if (!isVisible || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-4xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_60px_140px_-60px_rgba(15,23,42,0.9)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">🧪 FHE Playground</h3>
            <p className="text-sm text-slate-400">Experiment with raw homomorphic operations in a sandbox environment.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Close
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6 space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">1. Inputs (Plaintext)</h4>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <label className="text-xs text-slate-400">Value A</label>
                  <input
                    type="number"
                    value={inputA}
                    onChange={(e) => { setInputA(Number(e.target.value)); resetState(); }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>
                <div className="flex items-end pb-3 text-slate-500 font-bold">
                  {operation === "add" ? "+" : operation === "mul" ? "×" : "-"}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-xs text-slate-400">Value B</label>
                  <input
                    type="number"
                    value={inputB}
                    onChange={(e) => { setInputB(Number(e.target.value)); resetState(); }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(["add", "sub", "mul"] as const).map((op) => (
                  <button
                    key={op}
                    onClick={() => { setOperation(op); resetState(); }}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold uppercase transition ${
                      operation === op
                        ? "bg-sky-500 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleEncrypt}
                disabled={isEncrypted}
                className={`group w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                  isEncrypted
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 cursor-default"
                    : "border-slate-700 bg-slate-800/50 hover:border-sky-500 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:-translate-y-0.5 cursor-pointer text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isEncrypted ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400 group-hover:bg-sky-500 group-hover:text-white"}`}>1</span>
                    Encrypt Inputs
                  </span>
                  {isEncrypted ? <span>✅</span> : <span className="opacity-0 group-hover:opacity-100 transition-opacity">➡️</span>}
                </div>
                <p className={`text-xs mt-1 ml-8 ${isEncrypted ? "opacity-70" : "text-slate-400 group-hover:text-slate-300"}`}>Convert plaintext to ciphertext handles.</p>
              </button>

              <button
                onClick={handleCompute}
                disabled={!isEncrypted || isComputed}
                className={`group w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                  !isEncrypted
                    ? "opacity-40 cursor-not-allowed border-slate-800 bg-slate-900"
                    : isComputed
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 cursor-default"
                    : "border-slate-700 bg-slate-800/50 hover:border-sky-500 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:-translate-y-0.5 cursor-pointer text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isComputed ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400 group-hover:bg-sky-500 group-hover:text-white"}`}>2</span>
                    Compute Blindly
                  </span>
                  {isComputed ? <span>✅</span> : <span className="opacity-0 group-hover:opacity-100 transition-opacity">➡️</span>}
                </div>
                <p className={`text-xs mt-1 ml-8 ${isComputed ? "opacity-70" : "text-slate-400 group-hover:text-slate-300"}`}>Perform {operation} on encrypted data.</p>
              </button>

              <button
                onClick={handleDecrypt}
                disabled={!isComputed || isDecrypted}
                className={`group w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                  !isComputed
                    ? "opacity-40 cursor-not-allowed border-slate-800 bg-slate-900"
                    : isDecrypted
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200 cursor-default"
                    : "border-slate-700 bg-slate-800/50 hover:border-sky-500 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] hover:-translate-y-0.5 cursor-pointer text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${isDecrypted ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400 group-hover:bg-sky-500 group-hover:text-white"}`}>3</span>
                    Decrypt Result
                  </span>
                  {isDecrypted ? <span>🎉</span> : <span className="opacity-0 group-hover:opacity-100 transition-opacity">➡️</span>}
                </div>
                <p className={`text-xs mt-1 ml-8 ${isDecrypted ? "opacity-70" : "text-slate-400 group-hover:text-slate-300"}`}>Reveal the final outcome.</p>
              </button>
            </div>
          </div>

          {/* Visualization / Logs */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs">
              <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Console Output</span>
                <button onClick={resetState} className="text-sky-400 hover:text-sky-300">Clear</button>
              </div>
              <div className="space-y-2 text-slate-300 h-[300px] overflow-y-auto">
                {logs.length === 0 && <span className="text-slate-600 italic">Ready to start...</span>}
                {logs.map((log, i) => (
                  <div key={i} className="animate-fade-in">{log}</div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
              <h4 className="mb-2 text-sm font-semibold text-indigo-200">💡 What&apos;s happening?</h4>
              <p className="text-sm text-indigo-100/80 leading-relaxed">
                In a real FHEVM contract, the &quot;Compute&quot; step happens on-chain. Validators execute the logic on the ciphertext handles without ever seeing your inputs ({inputA} and {inputB}).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
