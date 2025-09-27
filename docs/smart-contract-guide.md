# 🏗️ FHE Smart Contract Development Guide

## Introduction

This guide provides a comprehensive walkthrough for developing Fully Homomorphic Encryption (FHE) enabled smart contracts using FHEVM. You'll learn how to handle encrypted data types, implement secure FHE operations, and build privacy-preserving dApps.

## Prerequisites

Before diving into FHE development, ensure you have:

- **Solidity Knowledge**: Comfortable with smart contract development
- **FHEVM Setup**: Hardhat configured with FHEVM plugin
- **Understanding of Encryption**: Basic concepts of public-key cryptography

## FHE Data Types

### Encrypted Numeric Types

FHEVM provides specialized encrypted data types:

```solidity
// Encrypted integers (most common)
euint8  smallValue;   // 0-255, lowest gas cost
euint16 mediumValue;  // 0-65,535
euint32 largeValue;   // 0-4,294,967,295 (most practical)

// Encrypted boolean
ebool flag;          // true/false, essential for conditions

// Encrypted address
eaddress user;       // Encrypted wallet address
```

### Choosing the Right Type

| Use Case | Recommended Type | Gas Cost | Range |
|----------|-----------------|----------|-------|
| **Game moves** | `euint8` | ⭐⭐⭐ | 0-255 |
| **Token amounts** | `euint32` | ⭐⭐ | 0-4B |
| **User IDs** | `euint32` | ⭐⭐ | 0-4B |
| **Boolean flags** | `ebool` | ⭐⭐⭐ | true/false |

## Basic FHE Operations

### 1. Encryption

Convert plaintext to encrypted values:

```solidity
// Encrypt a plaintext value
euint32 encrypted = FHE.asEuint32(42);

// Encrypt different sizes
euint8 small = FHE.asEuint8(10);
euint16 medium = FHE.asEuint16(1000);

// Encrypt boolean
ebool flag = FHE.asEbool(true);
```

### 2. Arithmetic Operations

Perform calculations on encrypted data:

```solidity
// Addition (commutative and associative)
euint32 sum = FHE.add(a, b);        // E(a) + E(b) = E(a + b)

// Subtraction
euint32 diff = FHE.sub(a, b);       // E(a) - E(b) = E(a - b)

// Multiplication
euint32 product = FHE.mul(a, b);    // E(a) × E(b) = E(a × b)

// Scalar operations
euint32 scaled = FHE.mul(a, 5);     // E(a) × 5 = E(a × 5)
```

### 3. Comparison Operations

Compare encrypted values without decryption:

```solidity
// Equality check
ebool isEqual = FHE.eq(a, b);       // E(a) == E(b) = E(a == b)

// Inequality
ebool notEqual = FHE.neq(a, b);     // E(a) != E(b) = E(a != b)

// Ordering comparisons
ebool greater = FHE.gt(a, b);       // E(a) > E(b) = E(a > b)
ebool gte = FHE.gte(a, b);          // E(a) >= E(b) = E(a >= b)
ebool lesser = FHE.lt(a, b);        // E(a) < E(b) = E(a < b)
ebool lte = FHE.lte(a, b);          // E(a) <= E(b) = E(a <= b)
```

### 4. Conditional Operations

Select values based on encrypted conditions:

```solidity
// Conditional selection
euint32 result = FHE.select(condition, a, b);
// E(condition) ? E(a) : E(b)

// Example: Private maximum
ebool isLarger = FHE.gt(newBid, currentMax);
euint32 newMax = FHE.select(isLarger, newBid, currentMax);
```

## Advanced FHE Patterns

### Handling External Encrypted Inputs

When receiving encrypted data from users:

```solidity
function submitSecretVote(
    euint8 encryptedVote,    // External encrypted input
    bytes calldata proof     // Zero-knowledge proof
) external {
    // Convert external format to internal
    euint8 internalVote = FHE.fromExternal(encryptedVote, proof);

    // Validate range (0-3 for voting options)
    ebool validRange = FHE.lte(internalVote, 3);

    // Only proceed if valid
    euint8 finalVote = FHE.select(validRange, internalVote, 0);

    // Store the vote
    votes[msg.sender] = finalVote;
}
```

### Batch Operations

Group multiple FHE operations for efficiency:

```solidity
function batchUpdate(
    euint32[] calldata values,
    bytes[] calldata proofs
) external {
    // Process multiple values in one transaction
    for (uint i = 0; i < values.length; i++) {
        euint32 decrypted = FHE.fromExternal(values[i], proofs[i]);
        processValue(decrypted);
    }
}
```

## Access Control and Permissions

### Granting Decryption Permissions

```solidity
// Allow specific user to decrypt
FHE.allow(encryptedValue, userAddress);

// Allow contract itself to use the value
FHE.allowThis(encryptedValue);

// Allow multiple users
FHE.allow(encryptedValue, user1);
FHE.allow(encryptedValue, user2);

// Remove permission
FHE.deny(encryptedValue, userAddress);
```

### Permission Best Practices

1. **Grant permissions immediately after encryption**
2. **Only grant to necessary users**
3. **Use temporary permissions when possible**
4. **Clean up permissions after use**

## Security Considerations

### Input Validation

Always validate encrypted inputs:

```solidity
function secureOperation(euint32 encryptedInput) external {
    // Validate range
    ebool inRange = FHE.and(
        FHE.gte(encryptedInput, minValue),
        FHE.lte(encryptedInput, maxValue)
    );

    // Only proceed if valid
    require(FHE.decrypt(inRange), "Input out of range");
}
```

### Reentrancy Protection

FHE operations can be expensive, so implement proper protection:

```solidity
bool private locked;

modifier noReentrancy() {
    require(!locked, "Reentrancy detected");
    locked = true;
    _;
    locked = false;
}

function secureFHEOperation() external noReentrancy {
    // FHE operations here
}
```

### Gas Limit Management

FHE operations consume significant gas:

```solidity
// Estimate gas before operations
uint256 gasEstimate = estimateGasForFHEOperation();

// Set appropriate gas limit
function callWithFHE() external {
    // Increase gas limit for FHE operations
    // Default: 30,000 gas
    // FHE operations: 200,000+ gas
}
```

## Common Patterns

### Private Counter

```solidity
contract PrivateCounter {
    euint32 private counter;

    function increment() external {
        // Only contract can modify
        FHE.allowThis(counter);

        // Increment encrypted counter
        counter = FHE.add(counter, 1);
    }

    function getCount() external view returns (euint32) {
        // Return encrypted count
        return counter;
    }
}
```

### Secret Auction

```solidity
contract SecretAuction {
    euint32 private highestBid;
    address private highestBidder;

    function bid(euint32 bidAmount) external {
        // Check if higher than current bid
        ebool isHigher = FHE.gt(bidAmount, highestBid);

        // Update if higher
        highestBid = FHE.select(isHigher, bidAmount, highestBid);
        highestBidder = FHE.select(isHigher, msg.sender, highestBidder);
    }
}
```

### Encrypted Voting

```solidity
contract EncryptedVoting {
    mapping(address => euint8) private votes;
    euint32 private totalVotes;

    function vote(euint8 choice) external {
        // Store encrypted vote
        votes[msg.sender] = choice;
        totalVotes = FHE.add(totalVotes, 1);
    }

    function getResults() external view returns (euint32) {
        // Return encrypted tally
        return totalVotes;
    }
}
```

## Testing FHE Contracts

### Local Testing Setup

```bash
# Start local FHEVM node
npx hardhat node

# Deploy contracts
npx hardhat deploy --network localhost

# Run tests
npm run test
```

### Writing FHE Tests

```solidity
contract FHEGuessingGameTest {
    function testGameFlow() public {
        // Start game
        uint256 gameId = guessingGame.startGame();

        // Make encrypted guess
        euint8 guess = FHE.asEuint8(1);  // Paper
        guessingGame.makeGuess(gameId, guess);

        // Verify game state
        assert(guessingGame.getGameState(gameId) == GameState.Completed);
    }
}
```

### Debugging FHE Operations

```solidity
// Add debug events
event DebugFHE(
    address user,
    euint32 value,
    bool hasPermission
);

function debugOperation(euint32 value) external {
    bool permission = FHE.hasPermission(value, msg.sender);
    emit DebugFHE(msg.sender, value, permission);
}
```

## Deployment Best Practices

### Testnet Deployment

```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Verify contract
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Mainnet Considerations

1. **Higher Gas Costs**: FHE operations more expensive on mainnet
2. **Network Congestion**: Consider timing of deployments
3. **Security Audits**: Essential before mainnet deployment
4. **Monitoring**: Set up proper monitoring and alerting

## Performance Optimization

### Gas Optimization Strategies

1. **Minimize FHE Operations**
   ```solidity
   // Instead of multiple operations
   euint32 result = FHE.add(FHE.mul(a, b), FHE.add(c, d));

   // Use batch operations when possible
   function batchProcess(euint32[] calldata values) external {
       // Process multiple values efficiently
   }
   ```

2. **Selective Encryption**
   ```solidity
   // Only encrypt sensitive fields
   struct UserData {
       address wallet;        // Public ✅
       euint32 secretValue;   // Encrypted 🔐
       uint256 publicScore;   // Public ✅
   }
   ```

3. **Caching Results**
   ```solidity
   // Cache expensive computations
   mapping(bytes32 => euint32) private cache;

   function getCachedResult(bytes32 key) external returns (euint32) {
       if (FHE.isInitialized(cache[key])) {
           return cache[key];  // Return cached
       }
       // Compute and cache
       euint32 result = expensiveFHEComputation();
       cache[key] = result;
       return result;
   }
   ```

## Error Handling

### Common Error Patterns

```solidity
// Handle FHE operation failures
function safeFHEOperation() external {
    try {
        euint32 result = FHE.add(a, b);
        // Success
    } catch {
        // Handle failure
        revert("FHE operation failed");
    }
}

// Validate inputs
function validatedOperation(euint32 value) external {
    // Check if value is initialized
    require(FHE.isInitialized(value), "Invalid encrypted value");

    // Check permissions
    require(FHE.hasPermission(value, msg.sender), "No permission");
}
```

## Integration with Frontend

### Passing Encrypted Data

```javascript
// Frontend: Encrypt data before sending
const plaintextValue = 42;
const encryptedValue = await fhevm.encrypt(plaintextValue);

// Send to contract
const tx = await contract.makeGuess(gameId, encryptedValue);
```

### Receiving Encrypted Results

```javascript
// Contract returns encrypted result
const encryptedResult = await contract.getResult(gameId);

// Frontend: Decrypt the result
const decryptedResult = await fhevm.decrypt(encryptedResult);
```

## Best Practices Summary

### Security
- ✅ Always validate encrypted inputs
- ✅ Set proper access permissions
- ✅ Use reentrancy protection
- ✅ Implement proper error handling

### Performance
- ✅ Minimize FHE operations
- ✅ Use appropriate data types
- ✅ Batch operations when possible
- ✅ Cache expensive computations

### Maintainability
- ✅ Comprehensive documentation
- ✅ Clear function naming
- ✅ Proper error messages
- ✅ Extensive testing

## Next Steps

After mastering these fundamentals:

1. **Build Complex dApps**: Private auctions, voting systems, DeFi protocols
2. **Optimize Performance**: Advanced gas optimization techniques
3. **Cross-Contract Calls**: FHE data across multiple contracts
4. **Layer 2 Integration**: FHE on rollups and sidechains

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity FHE Guide](https://docs.zama.ai/protocol/solidity-guides)
- [Security Best Practices](https://docs.zama.ai/security)
- [Community Examples](https://github.com/zama-ai/fhevm-examples)

---

**Happy FHE Development!** 🚀 Remember, with great power comes great responsibility - always prioritize security and privacy in your FHE-enabled dApps.
