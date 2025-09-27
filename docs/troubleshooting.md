# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 🚫 Error: "FHE operation failed"

**Symptoms:**
- Transactions revert with FHE-related errors
- Cannot encrypt/decrypt values
- "Invalid proof" or "Decryption failed" messages

**Root Causes & Solutions:**

1. **Zama Relayer Offline**
   ```bash
   # Check relayer status
   curl https://status.zama.ai/

   # If offline, use demo mode or wait for service restoration
   ```

2. **Incorrect Network Configuration**
   ```javascript
   // Ensure you're on the correct network
   const correctNetwork = {
     chainId: '0x1f49',  // Zama testnet
     rpcUrl: 'https://devnet.zama.ai'
   };
   ```

3. **Insufficient Gas Limit**
   ```solidity
   // Increase gas limit for FHE operations
   contract.functionCall({
     gasLimit: 500000  // Default: 30000
   });
   ```

### 🚫 Error: "Transaction reverted"

**Symptoms:**
- Transactions fail during execution
- Out of gas errors
- Contract execution failures

**Root Causes & Solutions:**

1. **Insufficient ETH Balance**
   ```bash
   # Check balance
   npx hardhat balance --account <YOUR_ADDRESS>

   # Get testnet ETH from faucet
   https://faucet.zama.ai
   ```

2. **Gas Estimation Issues**
   ```javascript
   // Manual gas estimation for FHE operations
   const gasEstimate = await contract.estimateGas.functionName();
   const gasLimit = gasEstimate.mul(120).div(100); // +20% buffer
   ```

3. **Contract Deployment Problems**
   ```bash
   # Clean and redeploy
   npm run clean
   npm run compile
   npx hardhat deploy --network sepolia
   ```

### 🚫 Error: "Decryption failed"

**Symptoms:**
- Cannot decrypt FHE results
- "Permission denied" errors
- Invalid decryption keys

**Root Causes & Solutions:**

1. **Missing Decryption Permissions**
   ```solidity
   // Ensure permissions are granted
   FHE.allow(encryptedValue, msg.sender);
   FHE.allowThis(encryptedValue);
   ```

2. **Incorrect FHEVM SDK Usage**
   ```javascript
   // Proper decryption syntax
   const decrypted = await fhevm.decrypt(contractAddress, encryptedValue);
   ```

3. **Version Mismatch**
   ```bash
   # Update FHEVM dependencies
   npm update @fhevm/solidity @zama-fhe/relayer-sdk
   ```

## Debug Mode Setup

### Enable Debug Logging

```bash
# Terminal debugging
DEBUG=fhevm:* npm run dev

# Hardhat debugging
npx hardhat node --verbose

# Contract debugging
console.log("Debug:", encryptedValue);
```

### Network-Specific Debugging

```javascript
// Sepolia testnet debugging
const provider = new ethers.providers.JsonRpcProvider(
  'https://rpc.sepolia.org',
  { chainId: 11155111 }
);

// Zama devnet debugging
const zamaProvider = new ethers.providers.JsonRpcProvider(
  'https://devnet.zama.ai',
  { chainId: 8009 }
);
```

## Performance Issues

### High Gas Costs

**Problem:** FHE operations consume significant gas

**Solutions:**
1. **Batch Operations**
   ```solidity
   // Instead of multiple transactions
   function batchOperation() {
       // Perform multiple FHE operations in one tx
   }
   ```

2. **Selective Encryption**
   ```solidity
   // Only encrypt sensitive data
   struct Game {
       address player;        // Public ✅
       euint32 secretMove;    // Encrypted 🔐
       uint256 publicScore;   // Public ✅
   }
   ```

### Slow Transaction Confirmation

**Problem:** FHE transactions take longer to mine

**Solutions:**
1. **Increase Gas Price**
   ```javascript
   const tx = await contract.function({
     gasPrice: ethers.utils.parseUnits('50', 'gwei')
   });
   ```

2. **Use Flashbots**
   ```javascript
   // Private transaction pool for better reliability
   const flashbotsProvider = new FlashbotsProvider();
   ```

## Frontend-Specific Issues

### Wallet Connection Problems

**Problem:** Cannot connect to MetaMask/wallet

**Solutions:**
1. **Check Network**
   ```javascript
   // Ensure correct network
   if (window.ethereum.chainId !== '0x1f49') {
     await window.ethereum.request({
       method: 'wallet_switchEthereumChain',
       params: [{ chainId: '0x1f49' }]
     });
   }
   ```

2. **Reset Connection**
   ```javascript
   // Force wallet reconnection
   localStorage.removeItem('walletconnect');
   window.location.reload();
   ```

### Encryption Key Issues

**Problem:** Cannot generate or manage encryption keys

**Solutions:**
1. **Key Regeneration**
   ```javascript
   // Regenerate FHE keys
   const newKeys = await fhevm.generateKeypair();
   localStorage.setItem('fhe-keys', JSON.stringify(newKeys));
   ```

2. **Key Backup**
   ```javascript
   // Export keys for backup
   const keys = JSON.parse(localStorage.getItem('fhe-keys'));
   downloadFile('fhe-keys-backup.json', JSON.stringify(keys));
   ```

## Smart Contract Debugging

### Common Contract Errors

1. **State Validation Errors**
   ```solidity
   // Debug: Add state logging
   function makeGuess(uint256 gameId, externalEuint32 guess) external {
       Game storage game = games[gameId];

       // Debug logging
       emit DebugState(game.state, game.player, msg.sender);

       require(game.state == GameState.WaitingForGuess);
       require(game.player == msg.sender);
   }
   ```

2. **Permission Errors**
   ```solidity
   // Debug: Check permissions
   function debugPermissions(euint32 value) external view {
       bool hasPermission = FHE.hasPermission(value, msg.sender);
       emit DebugPermission(hasPermission);
   }
   ```

### Testing Contract Functions

```bash
# Run specific tests
npm run test -- --grep "should handle FHE operations"

# Test with gas reporting
npx hardhat test --network sepolia --gas

# Debug failing tests
DEBUG=* npx hardhat test
```

## Network-Specific Issues

### Sepolia Testnet

**Problem:** Transactions failing on Sepolia

**Solutions:**
1. **Check Faucet Balance**
   ```bash
   # Get testnet ETH
   curl -X POST https://faucet.sepolia.dev/api/faucet \
     -H "Content-Type: application/json" \
     -d '{"address": "0xYourAddress"}'
   ```

2. **Verify Contract Deployment**
   ```bash
   # Check if contract is deployed
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

### Zama Devnet

**Problem:** Cannot connect to Zama network

**Solutions:**
1. **Network Configuration**
   ```javascript
   const zamaNetwork = {
     chainId: '0x1f49',
     name: 'Zama Devnet',
     rpc: 'https://devnet.zama.ai',
     currency: 'ZAMA'
   };
   ```

2. **Alternative RPC**
   ```javascript
   // Backup RPC endpoints
   const backupRPCs = [
     'https://devnet.zama.ai',
     'https://backup.zama.network'
   ];
   ```

## Development Environment Issues

### Hardhat Configuration

**Problem:** Hardhat cannot compile FHE contracts

**Solutions:**
1. **Update Hardhat Config**
   ```typescript
   // hardhat.config.ts
   import '@fhevm/hardhat-plugin';

   const config: HardhatUserConfig = {
     networks: {
       zama: {
         url: 'https://devnet.zama.ai',
         chainId: 8009
       }
     },
     fhevm: {
       enabled: true
     }
   };
   ```

2. **Clean and Recompile**
   ```bash
   npm run clean
   npm run compile
   ```

### Dependency Conflicts

**Problem:** Package version conflicts

**Solutions:**
1. **Check Package Versions**
   ```bash
   npm ls @fhevm/solidity @zama-fhe/relayer-sdk
   ```

2. **Update Lockfile**
   ```bash
   rm package-lock.json
   npm install
   ```

## Getting Help

### Community Resources

1. **Zama Discord**: [discord.gg/zama](https://discord.gg/zama)
   - #fhevm-help channel
   - #dev-support channel

2. **GitHub Issues**: [github.com/zama-ai/fhevm/issues](https://github.com/zama-ai/fhevm/issues)
   - Search existing issues
   - Create detailed bug reports

3. **Stack Overflow**: Tag questions with `fhevm`

### Reporting Bugs

When reporting issues, include:

```markdown
## Bug Report

**Description:**
[Clear description of the problem]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. ...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Node.js version:
- npm version:
- OS:
- Browser (if frontend):
- Network:

**Error Messages:**
[Copy full error messages]

**Contract Code:**
[Relevant contract code]

**Minimal Reproduction:**
[Smallest code sample that reproduces the issue]
```

## Prevention Best Practices

### Development Workflow

1. **Test Locally First**
   ```bash
   npx hardhat node
   npm run test
   ```

2. **Use TypeScript**
   ```typescript
   // Better error catching
   const result: euint32 = await contract.function();
   ```

3. **Implement Proper Error Handling**
   ```solidity
   // Add try-catch in contracts
   function safeOperation() external {
       try {
           // FHE operations
       } catch {
           revert("Operation failed");
       }
   }
   ```

### Security Checklist

- [ ] All sensitive data encrypted
- [ ] Proper access permissions set
- [ ] Input validation implemented
- [ ] Gas limits tested
- [ ] Error handling added
- [ ] Tests passing

## Emergency Procedures

### If Everything Fails

1. **Reset Environment**
   ```bash
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Fresh Deployment**
   ```bash
   npx hardhat deploy --network sepolia --reset
   ```

3. **Contact Support**
   - Zama Discord: @support
   - GitHub: Create urgent issue
   - Email: support@zama.ai

---

**Remember**: FHEVM is cutting-edge technology. Some issues may be due to the rapidly evolving nature of the ecosystem. Always check for updates and keep your dependencies current!
