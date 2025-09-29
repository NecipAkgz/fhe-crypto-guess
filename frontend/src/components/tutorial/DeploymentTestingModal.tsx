import { CodeBlock } from '../shared/SyntaxHighlighter';

interface DeploymentTestingModalProps {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const deploymentSteps = [
  {
    title: "🧪 Local Testing",
    description: "Test your FHE dApp locally using Hardhat's local network before deploying to testnet or mainnet.",
    code: `# Start local FHEVM node
npx hardhat node

# Deploy to local network
npx hardhat deploy --network localhost

# Run tests
npm run test

# Test with gas reporting
npx hardhat test --network localhost --gas`
  },
  {
    title: "🚀 Testnet Deployment",
    description: "Deploy your contracts to Zama's testnet for real-world testing with FHEVM's full capabilities.",
    code: `# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# Get testnet ETH
curl -X POST https://faucet.sepolia.dev/api/faucet \\
  -H "Content-Type: application/json" \\
  -d '{"address": "0xYourAddress"}'`
  },
  {
    title: "🔧 Debugging FHE Issues",
    description: "Learn to debug common FHE-related issues including gas problems, decryption failures, and network issues.",
    code: `# Enable debug logging
DEBUG=fhevm:* npm run dev

# Check FHE operation status
curl https://api.zama.ai/fhe/status

# Debug gas usage
npx hardhat test --gas

# Check relayer connectivity
npm run debug:relayer`
  },
  {
    title: "📊 Performance Optimization",
    description: "Optimize your dApp for production by minimizing gas costs and improving user experience with FHE operations.",
    code: `// Gas optimization strategies
- Use euint8 instead of euint32 when possible
- Batch multiple FHE operations
- Cache encrypted results
- Implement fallback modes

// Performance monitoring
const startTime = Date.now();
// FHE operation
const endTime = Date.now();
console.log(\`FHE operation took: \${endTime - startTime}ms\`);`
  }
];

export const DeploymentTestingModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: DeploymentTestingModalProps) => {
  if (!isVisible) return null;

  const currentStep = deploymentSteps[step - 1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-4xl rounded-3xl border border-slate-800/70 bg-slate-950/90 p-10 shadow-[0_60px_140px_-60px_rgba(15,23,42,0.9)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20 text-lg font-bold text-orange-200">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-100">{currentStep?.title}</h3>
            <p className="text-sm text-slate-400">Deployment & Testing - Step {step} of {deploymentSteps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-800/70 px-3 py-1 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="leading-relaxed text-slate-300">{currentStep?.description}</p>

          {currentStep?.code && (
            <CodeBlock
              code={currentStep.code}
              language="bash"
              title="Terminal Commands"
            />
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
          <h4 className="mb-2 text-sm font-semibold text-orange-200">⚠️ Important Note</h4>
          <p className="text-sm text-orange-100/90">
            {step === 1 && "Always test FHE operations locally first - they cost 10-20x more gas than regular operations!"}
            {step === 2 && "Get plenty of testnet ETH before deploying - FHE transactions can cost 500k+ gas."}
            {step === 3 && "Use debug mode to troubleshoot FHE issues. Check docs/troubleshooting.md for common solutions."}
            {step === 4 && "Monitor gas usage closely. Consider fallback modes for expensive operations."}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="rounded-full border border-slate-800/70 bg-slate-900/40 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600/60 hover:text-slate-100"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Step {step} of {deploymentSteps.length}</span>
            <div className="flex gap-1">
              {deploymentSteps.map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${i + 1 === step ? 'bg-orange-400' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-400 hover:to-amber-400"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400"
              >
                Tutorial Complete! 🎉
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
