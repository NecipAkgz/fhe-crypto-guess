"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/hooks/useWallet";
import { startNewGame, makeGuess, getGameResult, checkServices } from "@/lib/game";
import { type ServiceStatus } from "@/lib/serviceStatus";
import { ethers } from "ethers";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Enhanced FHE Education Component with Interactive Features
const FHEEducationStep = ({
  step,
  title,
  description,
  code,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: {
  step: number;
  title: string;
  description: string;
  code?: string;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">FHE Learning Module - Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            Skip Tutorial
          </button>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-slate-700 leading-relaxed">{description}</p>

          {code && (
            <div className="rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 uppercase tracking-wide border-b border-slate-700">
                Smart Contract Example
              </div>
              <SyntaxHighlighter
                language="solidity"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                showLineNumbers={false}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">🎯 Key Takeaway</h4>
          <p className="text-sm text-blue-800">
            {step === 1 && "FHE allows computations on encrypted data without decryption, enabling privacy-preserving smart contracts."}
            {step === 2 && "Traditional encryption requires decryption before processing, exposing sensitive data. FHE keeps everything encrypted."}
            {step === 3 && "FHE uses advanced mathematics to perform operations on ciphertexts, producing encrypted results."}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Step {step} of 3</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                Start Building! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Environment Setup Tutorial Modal
const EnvironmentSetupModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}) => {
  if (!isVisible) return null;

  const steps = [
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

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">Environment Setup - Step {step} of {steps.length}</p>
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
            <div className="rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 uppercase tracking-wide border-b border-slate-700">
                Setup Commands
              </div>
              <SyntaxHighlighter
                language="bash"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                showLineNumbers={false}
              >
                {currentStep.code}
              </SyntaxHighlighter>
            </div>
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
            <span>Step {step} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
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

// Smart Contract Development Modal
const SmartContractModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}) => {
  if (!isVisible) return null;

  const steps = [
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

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">Smart Contract Development - Step {step} of {steps.length}</p>
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
            <div className="rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 uppercase tracking-wide border-b border-slate-700">
                Solidity Code Example
              </div>
              <SyntaxHighlighter
                language="solidity"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                showLineNumbers={false}
              >
                {currentStep.code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        <div className="mb-6 rounded-lg bg-purple-50 p-4">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-purple-800">
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                ← Previous
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Step {step} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${i + 1 === step ? 'bg-purple-500' : 'bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {hasNext ? (
              <button
                onClick={onNext}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700"
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

// Frontend Integration Modal
const FrontendIntegrationModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}) => {
  if (!isVisible) return null;

  const steps = [
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

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">Frontend Integration - Step {step} of {steps.length}</p>
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
            <div className="rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 uppercase tracking-wide border-b border-slate-700">
                React/TypeScript Code
              </div>
              <SyntaxHighlighter
                language="typescript"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                showLineNumbers={false}
              >
                {currentStep.code}
              </SyntaxHighlighter>
            </div>
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
            <span>Step {step} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
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

// Deployment and Testing Modal
const DeploymentTestingModal = ({
  step,
  isVisible,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious
}: {
  step: number;
  isVisible: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}) => {
  if (!isVisible) return null;

  const steps = [
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

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
            {step}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-slate-900">{currentStep?.title}</h3>
            <p className="text-sm text-slate-500">Deployment & Testing - Step {step} of {steps.length}</p>
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
            <div className="rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 text-xs text-slate-300 uppercase tracking-wide border-b border-slate-700">
                Terminal Commands
              </div>
              <SyntaxHighlighter
                language="bash"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                showLineNumbers={false}
              >
                {currentStep.code}
              </SyntaxHighlighter>
            </div>
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
            <span>Step {step} of {steps.length}</span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
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

// Encryption Progress Component
const EncryptionProgress = ({
  currentStep,
  totalSteps
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <div className="mb-6 rounded-xl bg-blue-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-blue-900">Encryption Progress</h4>
        <span className="text-xs text-blue-600">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="mb-3 flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i < currentStep ? "bg-blue-500" : "bg-blue-200"
            }`}
          />
        ))}
      </div>

      <div className="text-xs text-blue-700">
        {currentStep === 1 && "🔐 Generating encryption keys..."}
        {currentStep === 2 && "📝 Encrypting your choice..."}
        {currentStep === 3 && "⛓️ Sending to blockchain..."}
        {currentStep === 4 && "🔍 Computing result (blind)..."}
        {currentStep === 5 && "🔓 Decrypting result..."}
      </div>
    </div>
  );
};

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

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

  // Enhanced FHE Education states
  const [currentEducationStep, setCurrentEducationStep] = useState(0);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showTutorialWizard, setShowTutorialWizard] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  // Tutorial modal states
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showFrontendModal, setShowFrontendModal] = useState(false);
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [currentEnvStep, setCurrentEnvStep] = useState(1);
  const [currentContractStep, setCurrentContractStep] = useState(1);
  const [currentFrontendStep, setCurrentFrontendStep] = useState(1);
  const [currentDeploymentStep, setCurrentDeploymentStep] = useState(1);

  // Enhanced FHE Education content with more depth
  const educationSteps = [
    {
      title: "🔐 What is Fully Homomorphic Encryption?",
      description: "Fully Homomorphic Encryption (FHE) is a revolutionary cryptographic technique that allows computations to be performed directly on encrypted data. In traditional systems, you need to decrypt data before processing it, exposing sensitive information. FHE eliminates this vulnerability by enabling 'blind computation' - your private data stays encrypted throughout the entire process.",
      code: `// Traditional Blockchain (INSECURE):
// function makeMove(uint8 move) public {
//     playerMove = move;  // ❌ Visible to everyone!
//     result = computeResult(move, computerMove);
// }

// FHEVM Approach (SECURE):
// function makeMove(euint8 encryptedMove) public {
//     euint8 result = computeFHE(encryptedMove, computerChoice);
//     // ✅ Everything stays encrypted!
// }`
    },
    {
      title: "🛡️ Why Do We Need FHE?",
      description: "Blockchain's transparency is both a strength and a weakness. While it ensures trust through visibility, it also means sensitive data like your game moves, voting choices, or financial information becomes public. FHE solves this privacy paradox by enabling confidential smart contracts where the computation logic remains transparent while user data stays completely private.",
      code: `// PRIVACY COMPARISON:

// Without FHE:
playerMove = 0;        // 🟡 Visible on-chain
computerMove = 1;      // 🟡 Visible on-chain
result = "You Lost";   // 🟡 Visible on-chain

// With FHE:
E(playerMove) = "E(0)";     // 🟢 Encrypted
E(computerMove) = "E(1)";   // 🟢 Encrypted
E(result) = "E(false)";     // 🟢 Only you can decrypt!`
    },
    {
      title: "⚡ How FHE Magic Works",
      description: "FHE uses advanced mathematical operations (homomorphic means 'same structure') that preserve the ability to perform calculations on ciphertexts. When you encrypt your move, the smart contract can compare it with the computer's encrypted choice and produce an encrypted result - all without ever seeing the plaintext values. Only you hold the decryption key to reveal the final outcome.",
      code: `// FHE Mathematical Operations:
// E(a) + E(b) = E(a + b)  ✅ Addition works!
// E(a) × E(b) = E(a × b)  ✅ Multiplication works!
// E(a) == E(b) = E(a == b) ✅ Comparison works!

// Your game flow:
// 1. You encrypt: "Rock" → E(0)
// 2. Contract computes: E(0) vs E(1) = E(false)
// 3. You decrypt: E(false) → "You lost!"
// 4. No one else learns your move! 🎉`
    }
  ];

  // Tutorial wizard for first-time users
  const tutorialSteps = [
    {
      title: "Welcome to FHEVM Development! 🚀",
      description: "You're about to build your first privacy-preserving dApp. This interactive tutorial will guide you through the process step by step.",
      action: "Start Tutorial"
    },
    {
      title: "Set Up Your Development Environment",
      description: "We'll help you configure Hardhat, install FHEVM dependencies, and prepare your wallet for encrypted transactions.",
      action: "Configure Environment"
    },
    {
      title: "Write Your First FHE Smart Contract",
      description: "Learn to use encrypted data types (euint32, ebool) and FHE operations in your Solidity contracts.",
      action: "Write Contract"
    },
    {
      title: "Build the Frontend Interface",
      description: "Create a React interface that handles encryption, wallet connections, and user interactions.",
      action: "Build Frontend"
    },
    {
      title: "Deploy and Test Your dApp",
      description: "Deploy to testnet, run comprehensive tests, and verify everything works as expected.",
      action: "Deploy & Test"
    }
  ];

  // Show education modal with navigation
  const showEducation = (step: number) => {
    setCurrentEducationStep(step);
    setShowEducationModal(true);
  };

  // Navigate education steps
  const nextEducationStep = () => {
    if (currentEducationStep < educationSteps.length - 1) {
      setCurrentEducationStep(currentEducationStep + 1);
    }
  };

  const previousEducationStep = () => {
    if (currentEducationStep > 0) {
      setCurrentEducationStep(currentEducationStep - 1);
    }
  };

  // Start tutorial wizard
  const startTutorial = () => {
    setShowTutorialWizard(true);
    setShowEducationModal(false);
  };

  // Handle tutorial step actions
  const handleTutorialStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Start Tutorial
        setShowTutorialWizard(false);
        showEducation(0);
        break;
      case 1: // Configure Environment
        setShowTutorialWizard(false);
        setCurrentEnvStep(1);
        setShowEnvironmentModal(true);
        break;
      case 2: // Write Contract
        setShowTutorialWizard(false);
        setCurrentContractStep(1);
        setShowContractModal(true);
        break;
      case 3: // Build Frontend
        setShowTutorialWizard(false);
        setCurrentFrontendStep(1);
        setShowFrontendModal(true);
        break;
      case 4: // Deploy & Test
        setShowTutorialWizard(false);
        setCurrentDeploymentStep(1);
        setShowDeploymentModal(true);
        break;
      default:
        break;
    }
  };

  // Environment modal navigation
  const nextEnvStep = () => {
    if (currentEnvStep < 4) {
      setCurrentEnvStep(currentEnvStep + 1);
    }
  };

  const prevEnvStep = () => {
    if (currentEnvStep > 1) {
      setCurrentEnvStep(currentEnvStep - 1);
    }
  };

  // Contract modal navigation
  const nextContractStep = () => {
    if (currentContractStep < 4) {
      setCurrentContractStep(currentContractStep + 1);
    }
  };

  const prevContractStep = () => {
    if (currentContractStep > 1) {
      setCurrentContractStep(currentContractStep - 1);
    }
  };

  // Frontend modal navigation
  const nextFrontendStep = () => {
    if (currentFrontendStep < 4) {
      setCurrentFrontendStep(currentFrontendStep + 1);
    }
  };

  const prevFrontendStep = () => {
    if (currentFrontendStep > 1) {
      setCurrentFrontendStep(currentFrontendStep - 1);
    }
  };

  // Deployment modal navigation
  const nextDeploymentStep = () => {
    if (currentDeploymentStep < 4) {
      setCurrentDeploymentStep(currentDeploymentStep + 1);
    }
  };

  const prevDeploymentStep = () => {
    if (currentDeploymentStep > 1) {
      setCurrentDeploymentStep(currentDeploymentStep - 1);
    }
  };

  // Simulate encryption progress
  const simulateEncryption = async () => {
    setShowProgress(true);
    setEncryptionProgress(0);

    const steps = [1, 2, 3, 4, 5];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setEncryptionProgress(step);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setShowProgress(false);
  };

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
      const provider = new ethers.BrowserProvider(window.ethereum!);
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
      const provider = new ethers.BrowserProvider(window.ethereum!);
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
    <>
      <FHEEducationStep
        step={currentEducationStep + 1}
        title={educationSteps[currentEducationStep]?.title || ""}
        description={educationSteps[currentEducationStep]?.description || ""}
        code={educationSteps[currentEducationStep]?.code}
        isVisible={showEducationModal}
        onClose={() => {
          setShowEducationModal(false);
          if (currentEducationStep === educationSteps.length - 1) {
            setTutorialCompleted(true);
          }
        }}
        onNext={nextEducationStep}
        onPrevious={previousEducationStep}
        hasNext={currentEducationStep < educationSteps.length - 1}
        hasPrevious={currentEducationStep > 0}
      />

      {/* Environment Setup Modal */}
      <EnvironmentSetupModal
        step={currentEnvStep}
        isVisible={showEnvironmentModal}
        onClose={() => setShowEnvironmentModal(false)}
        onNext={nextEnvStep}
        onPrevious={prevEnvStep}
        hasNext={currentEnvStep < 4}
        hasPrevious={currentEnvStep > 1}
      />

      {/* Smart Contract Development Modal */}
      <SmartContractModal
        step={currentContractStep}
        isVisible={showContractModal}
        onClose={() => setShowContractModal(false)}
        onNext={nextContractStep}
        onPrevious={prevContractStep}
        hasNext={currentContractStep < 4}
        hasPrevious={currentContractStep > 1}
      />

      {/* Frontend Integration Modal */}
      <FrontendIntegrationModal
        step={currentFrontendStep}
        isVisible={showFrontendModal}
        onClose={() => setShowFrontendModal(false)}
        onNext={nextFrontendStep}
        onPrevious={prevFrontendStep}
        hasNext={currentFrontendStep < 4}
        hasPrevious={currentFrontendStep > 1}
      />

      {/* Deployment and Testing Modal */}
      <DeploymentTestingModal
        step={currentDeploymentStep}
        isVisible={showDeploymentModal}
        onClose={() => setShowDeploymentModal(false)}
        onNext={nextDeploymentStep}
        onPrevious={prevDeploymentStep}
        hasNext={currentDeploymentStep < 4}
        hasPrevious={currentDeploymentStep > 1}
      />

      {/* Tutorial Wizard Component */}
      {showTutorialWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">🚀 FHEVM Development Tutorial</h2>
              <p className="text-slate-600">Your step-by-step guide to building privacy-preserving dApps</p>
            </div>

            <div className="space-y-4 mb-8">
              {tutorialSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                  <button
                    onClick={() => handleTutorialStep(index)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    {step.action}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowTutorialWizard(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Maybe Later
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowTutorialWizard(false)}
                  className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Skip Tutorial
                </button>
                <button
                  onClick={() => {
                    setShowTutorialWizard(false);
                    showEducation(0);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Start Learning! 📚
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="flex w-full flex-col gap-6 rounded-2xl border border-slate-200 bg-white/90 p-8">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Play a round</h2>
              <p className="text-sm text-slate-500">
                Start an encrypted match and keep every move hidden from the contract.
              </p>
            </div>

            {/* Enhanced FHE Education Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowTutorialWizard(true)}
                className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                title="Complete tutorial wizard"
              >
                🚀 Full Tutorial
              </button>
              <button
                onClick={() => showEducation(0)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                title="Learn about FHE"
              >
                📚 What is FHE?
              </button>
              <button
                onClick={() => showEducation(1)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                title="Why FHE is needed"
              >
                ❓ Why FHE?
              </button>
              <button
                onClick={() => showEducation(2)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                title="How FHE works"
              >
                ⚙️ How it works
              </button>
            </div>
          </div>

          {/* Show encryption progress when active */}
          {showProgress && (
            <EncryptionProgress currentStep={encryptionProgress} totalSteps={5} />
          )}
        </header>

      {serviceStatus && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            demoMode
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <p className="font-medium">
            {demoMode ? "Demo mode" : "FHEVM Ready"}
          </p>
          <p className="mt-1 text-xs opacity-80">
            {demoMode
              ? "Relayer service unavailable. Using fallback mode with mock responses."
              : "Zama Relayer is online. Your moves are fully encrypted and secure."}
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
                Zama Relayer is currently unavailable. Game continues with fallback mode.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-700">🔐 Fully Encrypted</p>
              <p className="mt-1">
                Powered by Zama FHEVM. Your moves are encrypted end-to-end with zero-knowledge proofs.
              </p>
            </>
          )}
        </footer>
      </section>
    </>
  );
}
