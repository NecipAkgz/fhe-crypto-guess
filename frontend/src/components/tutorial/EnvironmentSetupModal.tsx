import { CodeBlock } from '../shared/SyntaxHighlighter';

interface EnvironmentSetupModalProps {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const setupSteps = [
  {
    title: "🛠️ Install Node.js & npm",
    description: "First, ensure you have Node.js version 20 or higher installed. This is required for FHEVM development tools and dependencies.",
    code: `# Check Node.js version
node --version  # Should be >= 20.0.0

# Check npm version
npm --version   # Should be >= 7.0.0

# If not installed, download from:
# https://nodejs.org/`
  },
  {
    title: "📦 Install Hardhat & FHEVM",
    description: "Set up the core development framework with FHEVM plugin support for building privacy-preserving smart contracts.",
    code: `# Create new project
npx hardhat init

# Install FHEVM dependencies
npm install @fhevm/hardhat-plugin @fhevm/solidity

# Install development tools
npm install --save-dev typescript ts-node`
  },
  {
    title: "⚙️ Configure Hardhat",
    description: "Update your hardhat.config.ts to include FHEVM network settings and plugin configuration.",
    code: `// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhevm/hardhat-plugin";

const config: HardhatUserConfig = {
  networks: {
    zama: {
      url: "https://devnet.zama.ai",
      chainId: 8009,
    }
  },
  fhevm: {
    enabled: true
  }
};

export default config;`
  },
  {
    title: "🔐 Set Up Your Wallet",
    description: "Configure MetaMask or another Web3 wallet to connect to Zama's testnet for FHEVM development.",
    code: `// Add Zama Devnet to MetaMask
Network Name: Zama Devnet
RPC URL: https://devnet.zama.ai
Chain ID: 8009
Currency Symbol: ZAMA

// Get testnet tokens
Visit: https://faucet.zama.ai`
  }
];

export const EnvironmentSetupModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: EnvironmentSetupModalProps) => {
  if (!isVisible) return null;

  const currentStep = setupSteps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">Environment Setup - Step {step} of {setupSteps.length}</p>
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
              title="Setup Commands"
            />
          )}
        </div>

        <div className="mb-6 rounded-lg bg-green-50 p-4">
          <h4 className="text-sm font-semibold text-green-900 mb-2">✅ Checkpoint</h4>
          <p className="text-sm text-green-800">
            {step === 1 && "Verify Node.js 20+ is installed and working correctly."}
            {step === 2 && "Ensure Hardhat and FHEVM dependencies are properly installed."}
            {step === 3 && "Confirm Hardhat config includes FHEVM settings."}
            {step === 4 && "Verify wallet is connected to Zama testnet."}
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
            <span>Step {step} of {setupSteps.length}</span>
            <div className="flex gap-1">
              {setupSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i + 1 === step ? 'bg-green-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Start Coding! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
