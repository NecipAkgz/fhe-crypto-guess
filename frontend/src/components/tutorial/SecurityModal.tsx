import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface SecurityModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SecurityModal = ({ isVisible, onClose }: SecurityModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"replay" | "network">("replay");
  const [replayStep, setReplayStep] = useState(0);

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
        className="mx-4 w-full max-w-4xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_60px_140px_-60px_rgba(15,23,42,0.9)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-100">🛡️ Security Deep Dive</h3>
            <p className="text-sm text-slate-400">Understand the attack vectors and how FHEVM prevents them.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Close
          </button>
        </header>

        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-1">
          <button
            onClick={() => setActiveTab("replay")}
            className={`px-4 py-2 text-sm font-semibold transition border-b-2 ${
              activeTab === "replay"
                ? "border-rose-500 text-rose-200"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Replay Attacks
          </button>
          <button
            onClick={() => setActiveTab("network")}
            className={`px-4 py-2 text-sm font-semibold transition border-b-2 ${
              activeTab === "network"
                ? "border-sky-500 text-sky-200"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Network Privacy
          </button>
        </div>

        {activeTab === "replay" && (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <h4 className="font-semibold text-slate-200 mb-2">The Scenario</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Imagine a user sends an encrypted &quot;Rock&quot; move. An attacker intercepts this ciphertext and tries to send it again later to force a draw or win.
                </p>
              </div>

              <div className="space-y-2">
                <div
                  className={`p-4 rounded-xl border transition-all duration-500 ${
                    replayStep >= 1 ? "border-emerald-500/30 bg-emerald-500/10" : "border-slate-800 bg-slate-950"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-200">1. Legitimate Tx</span>
                    {replayStep >= 1 && <span className="text-emerald-400 text-xs">Success</span>}
                  </div>
                  <code className="text-xs text-slate-500">Ciphertext: 0xAbC...123 (Nonce: 1)</code>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all duration-500 ${
                    replayStep >= 2 ? "border-rose-500/30 bg-rose-500/10" : "border-slate-800 bg-slate-950"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-200">2. Attacker Replay</span>
                    {replayStep >= 2 && <span className="text-rose-400 text-xs">Rejected!</span>}
                  </div>
                  <code className="text-xs text-slate-500">Ciphertext: 0xAbC...123 (Nonce: 1)</code>
                </div>
              </div>

              <button
                onClick={() => setReplayStep((prev) => (prev + 1) % 3)}
                className="w-full rounded-full bg-slate-800 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700"
              >
                {replayStep === 0 ? "Simulate Attack" : replayStep === 2 ? "Reset Demo" : "Next Step"}
              </button>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6">
              <h4 className="text-lg font-bold text-rose-200 mb-4">Why it fails</h4>
              <ul className="space-y-3 text-sm text-rose-100/80">
                <li className="flex gap-2">
                  <span>🛡️</span>
                  <span>
                    <strong>Ciphertext Binding:</strong> Ciphertexts are bound to the user&apos;s address and a specific contract address.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>🔢</span>
                  <span>
                    <strong>Nonces:</strong> Just like regular transactions, FHE inputs use nonces. Reusing a nonce invalidates the transaction.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span>🚫</span>
                  <span>
                    <strong>Validity Proofs:</strong> The ZK-proof attached to the ciphertext ensures it was generated freshly for this session.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "network" && (
          <div className="space-y-6">
            <div className="relative h-64 w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Simple Network Diagram */}
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500 flex items-center justify-center text-2xl">👤</div>
                  <p className="mt-2 text-xs font-bold text-sky-200">User</p>
                  <p className="text-[10px] text-slate-500">Holds Secret Key</p>
                </div>
                <div className="h-px w-24 bg-slate-700 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Ciphertext</div>
                  <div className="absolute top-0 left-0 h-full w-2 bg-sky-500 animate-pulse-slow" style={{ animationDuration: '2s' }}></div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-2xl">🔗</div>
                  <p className="mt-2 text-xs font-bold text-indigo-200">Validator</p>
                  <p className="text-[10px] text-slate-500">Computes Blindly</p>
                </div>
                <div className="h-px w-24 bg-slate-700 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Encrypted Res</div>
                  <div className="absolute top-0 left-0 h-full w-2 bg-indigo-500 animate-pulse-slow" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 border border-sky-500 flex items-center justify-center text-2xl">👤</div>
                  <p className="mt-2 text-xs font-bold text-sky-200">User</p>
                  <p className="text-[10px] text-slate-500">Decrypts Result</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                <h5 className="font-bold text-slate-200 mb-2">1. Encryption</h5>
                <p className="text-xs text-slate-400">Happens locally in the browser. The network never sees the plaintext input.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                <h5 className="font-bold text-slate-200 mb-2">2. Execution</h5>
                <p className="text-xs text-slate-400">Validators run the smart contract on encrypted data. They produce an encrypted result without knowing what it is.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                <h5 className="font-bold text-slate-200 mb-2">3. Decryption</h5>
                <p className="text-xs text-slate-400">Only the user (or authorized parties) can decrypt the output using their secret key.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
