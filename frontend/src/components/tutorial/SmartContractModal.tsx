import { CodeBlock } from '../shared/SyntaxHighlighter';

interface SmartContractModalProps {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const contractSteps = [
  {
    title: "📝 Understanding FHE Data Types",
    description: "FHEVM provides encrypted versions of standard Solidity types. These types work just like normal variables but keep your data private throughout computation.",
    code: `// Encrypted data types
euint8 playerChoice;    // 8-bit encrypted integer (0-255)
euint32 secretAmount;   // 32-bit encrypted integer
ebool gameResult;       // Encrypted boolean
eaddress player;        // Encrypted address

// Initialize encrypted values
playerChoice = FHE.asEuint8(1);  // Encrypt: 1
secretAmount = FHE.asEuint32(1000); // Encrypt: 1000`
  },
  {
    title: "🔐 FHE Operations",
    description: "Perform mathematical operations on encrypted data. The results remain encrypted and can only be decrypted by authorized users.",
    code: `// Arithmetic operations
euint32 sum = FHE.add(a, b);        // E(a) + E(b) = E(a + b)
euint32 product = FHE.mul(a, b);    // E(a) × E(b) = E(a × b)

// Comparison operations
ebool isEqual = FHE.eq(a, b);       // E(a) == E(b) = E(a == b)
ebool isGreater = FHE.gt(a, b);     // E(a) > E(b) = E(a > b)

// Conditional selection
euint32 result = FHE.select(condition, a, b); // E(condition) ? E(a) : E(b)`
  },
  {
    title: "🛡️ Access Control",
    description: "Control who can decrypt your encrypted data using FHE permission system. This ensures only authorized users can see the results.",
    code: `// Grant decryption permissions
FHE.allow(encryptedValue, userAddress);  // Allow specific user
FHE.allowThis(encryptedValue);           // Allow contract itself

// In your guessing game:
function startGame() external {
    euint32 computerChoice = FHE.asEuint32(random);
    FHE.allowThis(computerChoice);
    FHE.allow(computerChoice, msg.sender); // Only player can decrypt
}`
  },
  {
    title: "🎮 Complete Contract Example",
    description: "Here's how all these concepts come together in a complete FHE-enabled smart contract for our guessing game.",
    code: `contract FHEGuessingGame {
    struct Game {
        address player;
        euint32 computerChoice;  // Encrypted
        euint32 playerGuess;     // Encrypted
        GameState state;
    }

    function startGame() external returns (uint256 gameId) {
        // Generate and encrypt computer choice
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 3;
        euint32 encryptedChoice = FHE.asEuint32(random);

        // Set permissions
        FHE.allowThis(encryptedChoice);
        FHE.allow(encryptedChoice, msg.sender);

        // Store game
        games[gameId] = Game({
            player: msg.sender,
            computerChoice: encryptedChoice,
            playerGuess: euint32.wrap(0),
            state: GameState.WaitingForGuess
        });
    }
}`
  }
];

export const SmartContractModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: SmartContractModalProps) => {
  if (!isVisible) return null;

  const currentStep = contractSteps[step - 1];

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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-lg font-bold text-purple-200">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-100">{currentStep?.title}</h3>
            <p className="text-sm text-slate-400">Smart Contract Development - Step {step} of {contractSteps.length}</p>
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
              language="solidity"
              title="Solidity Code Example"
            />
          )}
        </div>

        <div className="mb-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5">
          <h4 className="mb-2 text-sm font-semibold text-purple-200">💡 Pro Tip</h4>
          <p className="text-sm text-purple-100/90">
            {step === 1 && "Always use the smallest encrypted type possible (euint8 vs euint32) to save gas costs."}
            {step === 2 && "FHE operations cost 10-20x more gas than plaintext operations. Use them wisely!"}
            {step === 3 && "Set FHE permissions immediately after encryption to avoid access issues."}
            {step === 4 && "Test your FHE contracts locally first, then deploy to testnet for gas optimization."}
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
            <span>Step {step} of {contractSteps.length}</span>
            <div className="flex gap-1">
              {contractSteps.map((_, i) => (
                <div key={i} className={`h-2 w-2 rounded-full ${i + 1 === step ? 'bg-purple-400' : 'bg-slate-700'}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-400 hover:to-indigo-400"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400"
              >
                Ready to Code! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
