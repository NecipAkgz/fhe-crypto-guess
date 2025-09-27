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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">Deployment & Testing - Step {step} of {deploymentSteps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-slate-700 leading-relaxed">{currentStep?.description}</p>

          {currentStep?.code && (
            <CodeBlock
              code={currentStep.code}
              language="bash"
              title="Terminal Commands"
            />
          )}
        </div>

        <div className="mb-6 rounded-lg bg-orange-50 p-4">
          <h4 className="text-sm font-semibold text-orange-900 mb-2">⚠️ Important Note</h4>
          <p className="text-sm text-orange-800">
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Step {step} of {deploymentSteps.length}</span>
            <div className="flex gap-1">
              {deploymentSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i + 1 === step ? 'bg-orange-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
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
