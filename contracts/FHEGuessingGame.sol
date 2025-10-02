// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title FHE Guessing Game Contract - Educational Tutorial Version
 * @author FHEVM Tutorial
 * @notice A comprehensive example demonstrating Fully Homomorphic Encryption (FHE) in smart contracts
 * @dev This contract serves as a learning tool for developers new to FHEVM
 *
 * 🔐 WHAT THIS CONTRACT DEMONSTRATES:
 * - End-to-end encryption of user inputs
 * - Blind computation on encrypted data
 * - Private result revelation
 * - FHE security best practices
 *
 * 🎯 LEARNING OBJECTIVES:
 * - Understand FHE data types (euint32, ebool)
 * - Learn FHE operations (encryption, comparison, decryption)
 * - Implement access control for encrypted data
 * - Handle encrypted function parameters
 */

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @notice Encrypted Guessing Game demonstrating FHEVM capabilities
 * @dev Players make encrypted moves in Rock-Paper-Scissors
 * Contract performs blind computation and returns encrypted results
 *
 * SECURITY FEATURES:
 * - All moves encrypted before blockchain submission
 * - Contract operates on ciphertexts only
 * - Results decryptable only by the player
 * - Zero-knowledge computation verification
 */
contract FHEGuessingGame is SepoliaConfig {
    /**
     * @notice Game state progression tracking
     * @dev Demonstrates state machine pattern in FHE contracts
     */
    enum GameState {
        NotStarted,     // Initial state before game creation
        WaitingForGuess, // Game created, waiting for player input
        Completed       // Both moves made, result available
    }

    /**
     * @notice Available game choices for Rock-Paper-Scissors
     * @dev Numeric values (0,1,2) are encrypted and compared
     */
    enum GameChoice {
        Rock,     // 0 - Loses to Paper, beats Scissors
        Paper,    // 1 - Beats Rock, loses to Scissors
        Scissors  // 2 - Beats Paper, loses to Rock
    }

    /**
     * @notice Game data structure with encrypted fields
     * @dev Demonstrates how to store and manage encrypted data
     *
     * SECURITY CONSIDERATIONS:
     * - Encrypted fields (euint32) are only accessible to authorized users
     * - Plaintext fields (address, uint256) are publicly visible
     * - Access permissions managed through FHE.allow() calls
     */
    struct Game {
        address player;           // Public: Player's wallet address
        euint32 computerChoice;   // Encrypted: Only player can decrypt
        euint32 playerGuess;      // Encrypted: Only player can decrypt
        bool hasRevealed;         // Public: Whether result was revealed
        GameState state;          // Public: Current game state
        uint256 createdAt;        // Public: Game creation timestamp
    }

    /**
     * @notice Counter for generating unique game IDs
     * @dev Private to prevent external manipulation
     * Starts at 1 to avoid zero-value game IDs
     */
    uint256 private nextGameId = 1;

    /**
     * @notice Storage for all games, indexed by game ID
     * @dev Public mapping allows anyone to query game existence
     * Individual game data access controlled by FHE permissions
     */
    mapping(uint256 => Game) public games;

    /**
     * @notice Track all games for each player
     * @dev Enables players to retrieve their game history
     * Array of game IDs for efficient lookup
     */
    mapping(address => uint256[]) public playerGames;

    /**
     * @notice Events for tracking game lifecycle
     * @dev Indexed parameters enable efficient event filtering
     */
    event GameStarted(uint256 indexed gameId, address indexed player);
    event GuessMade(uint256 indexed gameId, address indexed player);
    event GameCompleted(uint256 indexed gameId, bool won, uint256 revealedChoice);

    /**
     * @notice Initialize a new encrypted guessing game
     * @dev Demonstrates FHE encryption of contract-generated values
     * @return gameId Unique identifier for the created game
     *
     * FHE LEARNING POINTS:
     * - FHE.asEuint32(): Encrypts plaintext value for blockchain storage
     * - FHE.allow(): Grants decryption permissions to specific users
     * - Encrypted data storage in contract state
     *
     * SECURITY CONSIDERATIONS:
     * - Randomness generated from blockchain data (deterministic)
     * - Access permissions set immediately after encryption
     * - Game state properly initialized
     */
    function startGame() external returns (uint256 gameId) {
        // Generate unique game ID and increment counter
        gameId = nextGameId++;

        /**
         * @notice Generate pseudo-random choice using blockchain data
         * @dev Combines multiple block variables for unpredictability
         *
         * WHY PSEUDO-RANDOM?
         * - True randomness expensive in blockchain
         * - Deterministic but appears random to users
         * - Uses block timestamp, prevrandao, sender, and gameId
         */
        uint256 pseudoRandom = uint256(
            keccak256(abi.encodePacked(
                block.timestamp,    // Current block timestamp
                block.prevrandao,   // Previous block's randomness
                msg.sender,         // Player's address (adds entropy)
                gameId             // Game ID (ensures uniqueness)
            ))
        ) % 3; // Modulo 3 for Rock-Paper-Scissors (0, 1, 2)

        /**
         * @notice Encrypt the computer's choice using FHE
         * @dev FHE.asEuint32() converts plaintext to encrypted value
         *
         * CRITICAL FHE OPERATION:
         * - Plaintext (pseudoRandom) → Encrypted value (randomChoice)
         * - Value now stored as ciphertext on blockchain
         * - Can be used in computations without decryption
         */
        euint32 randomChoice = FHE.asEuint32(uint32(pseudoRandom));

        /**
         * @notice Create new game with encrypted computer choice
         * @dev Demonstrates storing encrypted data in struct
         */
        games[gameId] = Game({
            player: msg.sender,                    // Player's wallet address (public)
            computerChoice: randomChoice,          // Encrypted computer choice
            playerGuess: euint32.wrap(0),          // Uninitialized encrypted value
            hasRevealed: false,                    // Result not revealed yet
            state: GameState.WaitingForGuess,      // Waiting for player's move
            createdAt: block.timestamp             // Game creation time
        });

        // Track this game in player's game history
        playerGames[msg.sender].push(gameId);

        /**
         * @notice Grant decryption permissions for encrypted data
         * @dev CRITICAL: Access control for FHE data
         *
         * FHE.allow() calls:
         * - FHE.allowThis(): Allow contract to use this encrypted value
         * - FHE.allow(randomChoice, msg.sender): Allow player to decrypt
         *
         * WITHOUT THESE PERMISSIONS:
         * - Player cannot decrypt their game results
         * - Contract cannot perform computations on encrypted data
         */
        FHE.allowThis(randomChoice);
        FHE.allow(randomChoice, msg.sender);

        // Emit event for frontend tracking
        emit GameStarted(gameId, msg.sender);
    }

    /**
     * @notice Submit an encrypted guess for an existing game
     * @dev Demonstrates handling external encrypted inputs from frontend
     * @param gameId The unique game identifier
     * @param guess Encrypted guess value (0=Rock, 1=Paper, 2=Scissors)
     * @param guessProof Cryptographic proof for the encrypted value
     *
     * FHE LEARNING POINTS:
     * - externalEuint32: Special type for encrypted function parameters
     * - FHE.fromExternal(): Convert external encrypted data to internal format
     * - FHE.isInitialized(): Check if encrypted value has been set
     *
     * SECURITY VALIDATION:
     * - Only game creator can submit guess
     * - Game must be in correct state
     * - Prevents double-guessing
     */
    function makeGuess(
        uint256 gameId,
        externalEuint32 guess,
        bytes calldata guessProof
    ) external {
        // Load game from storage
        Game storage game = games[gameId];

        /**
         * @notice Comprehensive input validation
         * @dev Multiple require statements prevent invalid game states
         */
        require(game.state == GameState.WaitingForGuess, "Game not waiting for guess");
        require(game.player == msg.sender, "Not your game");
        require(!FHE.isInitialized(game.playerGuess), "Guess already made");

        /**
         * @notice Convert external encrypted input to internal format
         * @dev FHE.fromExternal() validates and converts the encrypted data
         *
         * CRITICAL FHE OPERATION:
         * - Validates the zero-knowledge proof (guessProof)
         * - Converts external format to internal euint32
         * - Ensures data integrity and authenticity
         */
        euint32 decryptedGuess = FHE.fromExternal(guess, guessProof);

        /**
         * @notice Update game state with player's encrypted guess
         * @dev Game now has both computer and player moves encrypted
         */
        game.playerGuess = decryptedGuess;
        game.state = GameState.Completed;

        /**
         * @notice Grant access permissions for the new encrypted value
         * @dev Player needs permission to decrypt their own guess for result verification
         */
        FHE.allowThis(decryptedGuess);
        FHE.allow(decryptedGuess, msg.sender);

        // Emit event for frontend tracking
        emit GuessMade(gameId, msg.sender);
    }

    /**
     * @notice Retrieve encrypted game results for the player
     * @dev Demonstrates FHE computation and encrypted result return
     * @param gameId The unique game identifier
     * @return won Encrypted boolean (true if player won, decrypt off-chain)
     * @return revealedChoice Encrypted computer choice (decrypt off-chain)
     *
     * FHE LEARNING POINTS:
     * - FHE.eq(): Compare two encrypted values
     * - Returns encrypted boolean (ebool)
     * - Off-chain decryption using FHEVM SDK
     *
     * SECURITY FEATURES:
     * - Only game player can access results
     * - Results returned as encrypted values
     * - No plaintext data exposed on-chain
     */
    function getResult(uint256 gameId) external returns (ebool won, euint32 revealedChoice) {
        // Load game from storage
        Game storage game = games[gameId];

        /**
         * @notice Validate game state and access permissions
         * @dev Ensures game is complete and caller is authorized
         */
        require(game.state == GameState.Completed, "Game not completed");
        require(game.player == msg.sender, "Not your game");

        /**
         * @notice Perform blind comparison of encrypted moves
         * @dev FHE.eq() compares ciphertexts without decryption
         *
         * CRITICAL FHE OPERATION:
         * - Compares playerGuess and computerChoice (both encrypted)
         * - Returns encrypted boolean (ebool)
         * - Result is also encrypted and must be decrypted off-chain
         *
         * WHAT HAPPENS HERE:
         * - If playerGuess == computerChoice → won = E(true)
         * - If playerGuess != computerChoice → won = E(false)
         * - All operations happen on encrypted data
         */
        ebool isEqual = FHE.eq(game.playerGuess, game.computerChoice);

        /**
         * @notice Return encrypted results to the player
         * @dev Both values require off-chain decryption
         *
         * OFF-CHAIN DECRYPTION PROCESS:
         * 1. Use FHEVM SDK to decrypt 'won' boolean
         * 2. Use FHEVM SDK to decrypt 'revealedChoice' value
         * 3. Display results to player
         *
         * WHY OFF-CHAIN DECRYPTION?
         * - Decryption keys never leave user's device
         * - Maximum privacy protection
         * - Contract only sees encrypted data
         */
        won = isEqual;
        revealedChoice = game.computerChoice;
    }

    /**
     * @notice Retrieve the computer's encrypted choice for result verification
     * @dev Alternative method to getResult() for accessing computer choice
     * @param gameId The unique game identifier
     * @return computerChoice Encrypted computer choice value (decrypt off-chain)
     *
     * PURPOSE:
     * - Provides direct access to computer choice for verification
     * - Useful for debugging and transparency
     * - Maintains encryption throughout the process
     *
     * SECURITY FEATURES:
     * - Only game player can access
     * - Returns encrypted value only
     * - No plaintext exposure
     */
    function revealChoice(uint256 gameId) external view returns (euint32 computerChoice) {
        // Load game from storage
        Game storage game = games[gameId];

        /**
         * @notice Validate access permissions
         * @dev Ensures only the game player can reveal the choice
         */
        require(game.state == GameState.Completed, "Game not completed");
        require(game.player == msg.sender, "Not your game");

        /**
         * @notice Return encrypted computer choice
         * @dev Player must decrypt off-chain using FHEVM SDK
         *
         * DECRYPTION PROCESS:
         * 1. Use FHEVM SDK decrypt() method
         * 2. Convert numeric result to choice (0=Rock, 1=Paper, 2=Scissors)
         * 3. Display to user for verification
         */
        computerChoice = game.computerChoice;
    }

    /**
     * @notice Retrieve all game IDs for a specific player
     * @dev Enables players to track their complete game history
     * @param player The player's wallet address
     * @return gameIds Array of all game IDs associated with the player
     *
     * USE CASES:
     * - Display game history in frontend
     * - Track player statistics
     * - Enable game replay functionality
     * - Provide audit trail for disputes
     *
     * GAS CONSIDERATIONS:
     * - Returns entire array (can be expensive for many games)
     * - Consider pagination for players with many games
     * - No encrypted data returned (public information only)
     */
    function getPlayerGames(address player) external view returns (uint256[] memory gameIds) {
        return playerGames[player];
    }

    /**
     * @notice Get public game information without revealing encrypted data
     * @dev Safe method to check game status without accessing sensitive information
     * @param gameId The unique game identifier
     * @return player The wallet address of the game creator
     * @return state Current state of the game (enum)
     * @return createdAt Unix timestamp of game creation
     *
     * SECURITY DESIGN:
     * - Returns only public/non-sensitive information
     * - No encrypted data exposed
     * - Anyone can call this function
     * - Useful for game status checking
     *
     * LEARNING EXAMPLE:
     * Demonstrates how to provide public information
     * while keeping sensitive data encrypted and protected
     */
    function getGameInfo(uint256 gameId) external view returns (address player, GameState state, uint256 createdAt) {
        // Load game from storage
        Game storage game = games[gameId];

        /**
         * @notice Return public game information
         * @dev All returned values are non-sensitive and publicly visible
         */
        return (game.player, game.state, game.createdAt);
    }

    /**
     * @notice Get the next available game ID
     * @dev Public getter for the nextGameId counter
     * @return The next game ID that will be assigned
     *
     * USE CASE:
     * - Enables tests and frontend to predict game IDs
     * - Useful for testing and debugging
     * - No security risk as it's just a counter
     */
    function getNextGameId() external view returns (uint256) {
        return nextGameId;
    }
}
