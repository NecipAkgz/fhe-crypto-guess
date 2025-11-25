import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface GasAnalyzerModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const OPERATIONS = [
  { id: "add", label: "Addition (+)", encryptedCost: 55000, plaintextCost: 21000, description: "Includes base transaction cost (21k). FHE overhead is relatively low for simple arithmetic." },
  { id: "sub", label: "Subtraction (-)", encryptedCost: 55000, plaintextCost: 21000, description: "Similar to addition. Efficient due to Zama's optimized programmable bootstrapping." },
  { id: "mul", label: "Multiplication (×)", encryptedCost: 150000, plaintextCost: 21000, description: "More complex, but Zama's latest version drastically reduced this cost." },
  { id: "eq", label: "Equality Check (==)", encryptedCost: 85000, plaintextCost: 21000, description: "Comparing encrypted values is now much faster." },
  { id: "select", label: "Select (Mux)", encryptedCost: 75000, plaintextCost: 21000, description: "Cheap control flow without revealing data." },
];

export const GasAnalyzerModal = ({ isVisible, onClose }: GasAnalyzerModalProps) => {
  useLockBodyScroll(isVisible);
  const [mounted, setMounted] = useState(false);
  const [selectedOp, setSelectedOp] = useState(OPERATIONS[0]);
  const [txCount, setTxCount] = useState(1);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isVisible || !mounted) return null;

  const totalEncrypted = selectedOp.encryptedCost * txCount;
  const totalPlaintext = selectedOp.plaintextCost * txCount;
  const ratio = Math.round(totalEncrypted / totalPlaintext);

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
            <h3 className="text-2xl font-bold text-slate-100">⛽ Gas Cost Analyzer</h3>
            <p className="text-sm text-slate-400">Estimate and compare the cost of FHE operations vs Plaintext.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Close
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Controls */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300">Select Operation</label>
              <div className="grid gap-2">
                {OPERATIONS.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setSelectedOp(op)}
                    className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                      selectedOp.id === op.id
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-100"
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300">Transaction Count: {txCount}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={txCount}
                onChange={(e) => setTxCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Visualization */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <h4 className="text-lg font-bold text-slate-100 mb-1">{selectedOp.label}</h4>
              <p className="text-sm text-slate-400 mb-6">{selectedOp.description}</p>

              <div className="space-y-6">
                {/* Encrypted Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-amber-200">FHE (Encrypted)</span>
                    <span className="font-mono text-amber-200">{totalEncrypted.toLocaleString()} gas</span>
                  </div>
                  <div className="h-8 w-full rounded-full bg-slate-800 overflow-hidden relative">
                    <div className="absolute inset-0 bg-amber-500/20 animate-pulse-slow"></div>
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 w-full"></div>
                  </div>
                </div>

                {/* Plaintext Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-400">Standard (Plaintext)</span>
                    <span className="font-mono text-slate-400">{totalPlaintext.toLocaleString()} gas</span>
                  </div>
                  <div className="h-8 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-slate-600"
                      style={{ width: `${(totalPlaintext / totalEncrypted) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">⚠️</div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Cost Multiplier: ~{ratio}x</p>
                    <p className="text-xs text-slate-400">FHE operations are computationally intensive. Use them only for data that strictly requires privacy.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <h5 className="text-sm font-bold text-sky-200 mb-1">Optimization Tip</h5>
              <p className="text-xs text-sky-100/80">
                To save gas, try to batch operations or use `euint8` instead of `euint32` where possible. Smaller types generate smaller ciphertexts and compute faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
