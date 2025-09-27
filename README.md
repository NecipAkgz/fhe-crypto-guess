# 🔐 FHEVM Guessing Game Tutorial

A comprehensive, beginner-friendly tutorial for building Fully Homomorphic Encryption (FHE) enabled dApps on the Zama Protocol. This project demonstrates how to create a privacy-preserving Rock-Paper-Scissors game where players' moves remain encrypted throughout the entire process.

## 🎯 Learning Objectives

By completing this tutorial, you will:

- ✅ Understand the fundamentals of Fully Homomorphic Encryption (FHE)
- ✅ Learn how FHEVM enables private smart contracts
- ✅ Build and deploy an FHE-enabled dApp from scratch
- ✅ Implement encrypted computations on the blockchain
- ✅ Create a user-friendly frontend with wallet integration
- ✅ Deploy and test your dApp on Zama's testnet

## 📋 Prerequisites

Before starting this tutorial, ensure you have:

- **Node.js**: Version 20 or higher
- **npm**: Package manager (yarn/pnpm also supported)
- **MetaMask**: Web3 wallet browser extension
- **Basic Solidity Knowledge**: Comfortable with smart contract development
- **Web3 Development Experience**: Familiar with React/Next.js and Hardhat

## 🏗️ What is FHEVM?

**Fully Homomorphic Encryption Virtual Machine (FHEVM)** allows smart contracts to perform computations on encrypted data without decrypting it first. This enables **privacy-preserving dApps** where sensitive user data never appears in plaintext on the blockchain.

### Traditional vs FHE Approach

| Aspect | Traditional Blockchain | FHEVM |
|--------|----------------------|-------|
| **Data Visibility** | Plaintext visible to all | Encrypted throughout |
| **Privacy** | ❌ No privacy guarantees | ✅ End-to-end encryption |
| **Computation** | Direct value operations | Encrypted value operations |
| **Use Cases** | Public data only | Private data processing |

## 🎮 Project Overview: Encrypted Guessing Game

In this tutorial, you'll build a Rock-Paper-Scissors game where:
- Players make encrypted moves (Rock/Paper/Scissors)
- Smart contract processes encrypted game logic
- Only the player can decrypt the result
- Game logic remains completely blind to external observers

## 🚀 Quick Start

### Step 1: Environment Setup

```bash
# Clone the repository
git clone https://github.com/NecipAkgz/fhe-crypto-guess.git
cd fhe-crypto-guess

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

```bash
# Set your wallet mnemonic for deployment
npx hardhat vars set MNEMONIC

# Set Infura API key for Sepolia testnet access
npx hardhat vars set INFURA_API_KEY

# Optional: Set Etherscan API key for contract verification
npx hardhat vars set ETHERSCAN_API_KEY
```

### Step 3: Compile and Test

```bash
# Compile the smart contracts
npm run compile

# Run tests
npm run test
```

### Step 4: Start Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dApp!

## 📚 Detailed Tutorial Sections

### Section 1: Understanding FHE Fundamentals
- [FHE Mathematical Concepts](./docs/fhe-fundamentals.md)
- [Encryption/Decryption Workflow](./docs/encryption-workflow.md)
- [FHEVM Architecture Overview](./docs/fhevm-architecture.md)

### Section 2: Smart Contract Development
- [FHE Data Types and Operations](./docs/smart-contract-guide.md)
- [Security Best Practices](./docs/security-guide.md)
- [Gas Optimization Techniques](./docs/gas-optimization.md)

### Section 3: Frontend Integration
- [FHEVM SDK Setup](./docs/frontend-integration.md)
- [Wallet Connection and Encryption](./docs/wallet-integration.md)
- [User Experience Patterns](./docs/ux-patterns.md)

### Section 4: Deployment and Testing
- [Local Development Setup](./docs/local-deployment.md)
- [Testnet Deployment Guide](./docs/testnet-deployment.md)
- [Testing and Verification](./docs/testing-guide.md)

## 🏛️ Smart Contract Architecture

### Core FHE Operations Used

```solidity
// Encrypted data types
euint32 playerChoice;    // Encrypted player move
euint32 computerChoice;  // Encrypted computer move
ebool gameResult;        // Encrypted win/lose result

// FHE operations
FHE.asEuint32(value)     // Encrypt a value
FHE.eq(a, b)            // Compare encrypted values
FHE.fromExternal(data, proof) // Decrypt external data
```

### Key Security Features

- **End-to-End Encryption**: Moves encrypted before blockchain submission
- **Zero-Knowledge Proofs**: Verify computations without revealing inputs
- **Access Control**: Only players can decrypt their own results
- **Blind Computation**: Smart contract operates on ciphertexts only

## 🎨 Frontend Architecture

### Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Web3 Integration**: wagmi + viem
- **FHE Operations**: FHEVM SDK
- **State Management**: React hooks

### Key Components

- **GameBoard**: Main game interface with move selection
- **FHEEducationStep**: Interactive learning modals
- **EncryptionProgress**: Visual feedback during FHE operations
- **Wallet Integration**: MetaMask connection and transaction handling

## 🧪 Testing Your Implementation

### Local Testing

```bash
# Start local FHEVM node
npx hardhat node

# Deploy to local network
npx hardhat deploy --network localhost

# Run tests
npm run test
```

### Testnet Deployment

```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Verify contract
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

**❌ Error: "FHE operation failed"**
- Check if Zama Relayer is online
- Verify encryption keys are properly generated
- Ensure correct network configuration

**❌ Error: "Transaction reverted"**
- Verify sufficient testnet ETH balance
- Check gas limit settings
- Ensure proper contract deployment

**❌ Error: "Decryption failed"**
- Confirm you have decryption permissions
- Check if re-encryption keys are valid
- Verify FHEVM SDK version compatibility

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=fhevm:* npm run dev
```

## 📊 Learning Progress Tracker

- [x] **Environment Setup**: Node.js, Hardhat, dependencies
- [x] **FHE Fundamentals**: Basic concepts and theory
- [x] **Smart Contract**: FHE operations and security
- [x] **Frontend Integration**: React + FHEVM SDK
- [x] **Local Testing**: Development and debugging
- [ ] **Testnet Deployment**: Production-ready deployment
- [ ] **Advanced Features**: Optimization and scaling

## 🎓 Next Steps After Tutorial

### Intermediate Projects
- **Private Voting Systems**: Encrypted ballot counting
- **Secret Auctions**: Blind bidding mechanisms
- **Private DEX**: Order matching without revealing amounts

### Advanced Topics
- **Gas Optimization**: Reducing FHE operation costs
- **Cross-Contract Calls**: FHE data across multiple contracts
- **Layer 2 Integration**: FHE on rollups and sidechains

## 📁 Project Structure

```
fhevm-guessing-game/
├── contracts/                 # Smart contracts
│   └── FHEGuessingGame.sol   # Main game contract with FHE
├── frontend/                 # Next.js application
│   ├── src/components/       # React components
│   ├── src/lib/             # Utility libraries
│   └── public/              # Static assets
├── deploy/                  # Deployment scripts
├── test/                    # Test files
├── docs/                    # Tutorial documentation
└── hardhat.config.ts        # Hardhat configuration
```

## 📚 Additional Resources

### Official Documentation
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)
- [FHEVM SDK Reference](https://docs.zama.ai/fhevm-sdk)

### Community Resources
- [Zama Discord](https://discord.gg/zama) - Get help and connect with developers
- [GitHub Issues](https://github.com/zama-ai/fhevm/issues) - Report bugs and request features
- [Stack Overflow](https://stackoverflow.com/questions/tagged/fhevm) - Q&A and troubleshooting

### Learning Materials
- [FHE Explained (Video Series)](https://www.youtube.com/zama-hq)
- [Research Papers](./docs/research-papers.md)
- [Security Audits](./docs/security-audits.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Ways to Contribute
- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit code improvements
- 🎓 Create learning content

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

**Need Help?**
1. Check the [Troubleshooting Guide](./docs/troubleshooting.md)
2. Search [existing issues](https://github.com/NecipAkgz/fhe-crypto-guess/issues)
3. Ask in [Zama Discord](https://discord.gg/zama)
4. Create a new [GitHub issue](https://github.com/NecipAkgz/fhe-crypto-guess/issues/new)

## 🎉 Congratulations!

You've successfully built your first FHE-enabled dApp! 🎊

**What you accomplished:**
- ✅ Built a privacy-preserving smart contract
- ✅ Integrated FHE operations in Solidity
- ✅ Created an encrypted user interface
- ✅ Deployed to blockchain network
- ✅ Learned cutting-edge privacy technology

**Share your success:**
- Tweet about your achievement with #FHEVM
- Share your dApp with the community
- Help other developers learn FHE

---

**Built with ❤️ for the FHEVM community**

*This tutorial demonstrates the power of Fully Homomorphic Encryption for building privacy-preserving applications on the Zama Protocol.*
