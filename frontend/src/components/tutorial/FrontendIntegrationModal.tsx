import { CodeBlock } from '../shared/SyntaxHighlighter';

interface FrontendIntegrationModalProps {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const frontendSteps = [
  {
    title: "⚛️ Set Up React + FHEVM SDK",
    description: "Install and configure the FHEVM SDK for seamless integration between your frontend and encrypted smart contracts.",
    code: `// Install FHEVM SDK
npm install @fhevm/sdk

// Initialize SDK in your app
import { FhevmSDK } from '@fhevm/sdk';

const sdk = new FhevmSDK('https://devnet.zama.ai');

// Generate encryption keys
const keys = await sdk.generateKeypair();
localStorage.setItem('fhe-keys', JSON.stringify(keys));`
  },
  {
    title: "🔗 Wallet Connection",
    description: "Connect users' wallets and handle network switching to ensure they're on the correct FHEVM-compatible network.",
    code: `// Wallet connection with network check
const connectWallet = async () => {
  if (window.ethereum) {
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });

    // Switch to Zama network if needed
    if (chainId !== '0x1f49') {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1f49' }]
      });
    }
  }
};`
  },
  {
    title: "🔐 Encryption Handling",
    description: "Encrypt user inputs before sending to smart contracts and handle the encryption/decryption workflow seamlessly.",
    code: `// Encrypt user input
const encryptMove = async (move: number) => {
  const encrypted = await sdk.encrypt(move);
  return {
    encryptedValue: encrypted,
    proof: encrypted.proof
  };
};

// Send encrypted transaction
const makeEncryptedMove = async (gameId: number, move: number) => {
  const { encryptedValue, proof } = await encryptMove(move);
  const tx = await contract.makeGuess(gameId, encryptedValue, proof);
  return tx.wait();
};`
  },
  {
    title: "🎨 UI/UX Best Practices",
    description: "Design user interfaces that clearly communicate the encryption process and provide feedback during FHE operations.",
    code: `// Progress indicators
const EncryptionProgress = ({ step }) => (
  <div className="bg-blue-50 p-4 rounded-lg">
    <div className="flex gap-2 mb-2">
      {steps.map((_, i) => (
        <div key={i} className={\`h-2 flex-1 rounded \${
          i < step ? 'bg-blue-500' : 'bg-blue-200'
        }\`} />
      ))}
    </div>
    <p className="text-sm text-blue-700">
      Step {step} of 5: Encrypting your move...
    </p>
  </div>
);`
  }
];

export const FrontendIntegrationModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: FrontendIntegrationModalProps) => {
  if (!isVisible) return null;

  const currentStep = frontendSteps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">Frontend Integration - Step {step} of {frontendSteps.length}</p>
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
              language="typescript"
              title="React/TypeScript Code"
            />
          )}
        </div>

        <div className="mb-6 rounded-lg bg-cyan-50 p-4">
          <h4 className="text-sm font-semibold text-cyan-900 mb-2">💡 Implementation Tip</h4>
          <p className="text-sm text-cyan-800">
            {step === 1 && "Always store encryption keys securely in localStorage but never in plain text."}
            {step === 2 && "Implement automatic network switching to ensure users are on the correct chain."}
            {step === 3 && "Show encryption progress to users so they understand what's happening behind the scenes."}
            {step === 4 && "Use loading states and progress bars to improve user experience during FHE operations."}
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
            <span>Step {step} of {frontendSteps.length}</span>
            <div className="flex gap-1">
              {frontendSteps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i + 1 === step ? 'bg-cyan-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Ready to Deploy! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
