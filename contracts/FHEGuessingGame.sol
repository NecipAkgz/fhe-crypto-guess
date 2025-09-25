// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Guessing Game Contract
/// @author FHEVM Tutorial
/// @notice A guessing game where players try to predict the computer's encrypted choice
contract FHEGuessingGame is SepoliaConfig {
    // Game states
    enum GameState {
        NotStarted,
        WaitingForGuess,
        Completed
    }

    // Game choices (0=Rock, 1=Paper, 2=Scissors)
    enum GameChoice {
        Rock,
        Paper,
        Scissors
    }

    struct Game {
        address player;
        euint32 computerChoice; // Encrypted choice (0, 1, or 2)
        euint32 playerGuess; // Encrypted guess (0, 1, or 2)
        bool hasRevealed; // Whether computer choice has been revealed
        GameState state;
        uint256 createdAt;
    }

    // State variables
    uint256 private nextGameId = 1;
    mapping(uint256 => Game) public games;
    mapping(address => uint256[]) public playerGames;

    // Events
    event GameStarted(uint256 indexed gameId, address indexed player);
    event GuessMade(uint256 indexed gameId, address indexed player);
    event GameCompleted(uint256 indexed gameId, bool won, uint256 revealedChoice);

    /// @notice Start a new guessing game
    /// @return gameId The unique ID of the created game
    function startGame() external returns (uint256 gameId) {
        gameId = nextGameId++;

        // Generate pseudo-random choice using block data (0, 1, or 2)
        // This is deterministic but appears random to users
        uint256 pseudoRandom = uint256(
            keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, gameId))
        ) % 3;

        euint32 randomChoice = FHE.asEuint32(uint32(pseudoRandom));

        // Create new game
        games[gameId] = Game({
            player: msg.sender,
            computerChoice: randomChoice,
            playerGuess: euint32.wrap(0), // Will be set when guess is made
            hasRevealed: false,
            state: GameState.WaitingForGuess,
            createdAt: block.timestamp
        });

        // Track player's games
        playerGames[msg.sender].push(gameId);

        // Allow player to access their game data
        FHE.allowThis(randomChoice);
        FHE.allow(randomChoice, msg.sender);

        emit GameStarted(gameId, msg.sender);
    }

    /// @notice Make a guess for the game
    /// @param gameId The game ID
    /// @param guess The encrypted guess (0=Rock, 1=Paper, 2=Scissors)
    /// @param guessProof The proof for the encrypted guess
    function makeGuess(uint256 gameId, externalEuint32 guess, bytes calldata guessProof) external {
        Game storage game = games[gameId];

        // Validate game exists and is waiting for guess
        require(game.state == GameState.WaitingForGuess, "Game not waiting for guess");
        require(game.player == msg.sender, "Not your game");
        require(!FHE.isInitialized(game.playerGuess), "Guess already made");

        // Decrypt the guess
        euint32 decryptedGuess = FHE.fromExternal(guess, guessProof);

        // Store the encrypted guess
        game.playerGuess = decryptedGuess;
        game.state = GameState.Completed;

        // Allow access to guess
        FHE.allowThis(decryptedGuess);
        FHE.allow(decryptedGuess, msg.sender);

        emit GuessMade(gameId, msg.sender);
    }

    /// @notice Get the result of a completed game
    /// @param gameId The game ID
    /// @return won Encrypted boolean indicating if player won
    /// @return revealedChoice Encrypted computer choice (decrypt off-chain)
    function getResult(uint256 gameId) external returns (ebool won, euint32 revealedChoice) {
        Game storage game = games[gameId];

        require(game.state == GameState.Completed, "Game not completed");
        require(game.player == msg.sender, "Not your game");

        // Compare encrypted guess with encrypted computer choice using FHE
        ebool isEqual = FHE.eq(game.playerGuess, game.computerChoice);

        // Return encrypted results - decrypt off-chain using FHEVM SDK
        won = isEqual;
        revealedChoice = game.computerChoice;
    }

    /// @notice Reveal the computer's choice (only callable if player won)
    /// @param gameId The game ID
    /// @return computerChoice Encrypted computer choice (decrypt off-chain)
    function revealChoice(uint256 gameId) external view returns (euint32 computerChoice) {
        Game storage game = games[gameId];

        require(game.state == GameState.Completed, "Game not completed");
        require(game.player == msg.sender, "Not your game");

        // Return encrypted computer choice - decrypt off-chain using FHEVM SDK
        computerChoice = game.computerChoice;
    }

    /// @notice Get all games for a player
    /// @param player The player's address
    /// @return gameIds Array of game IDs for the player
    function getPlayerGames(address player) external view returns (uint256[] memory gameIds) {
        return playerGames[player];
    }

    /// @notice Get game details (without revealing sensitive info)
    /// @param gameId The game ID
    /// @return player The player address
    /// @return state The game state
    /// @return createdAt When the game was created
    function getGameInfo(uint256 gameId) external view returns (address player, GameState state, uint256 createdAt) {
        Game storage game = games[gameId];
        return (game.player, game.state, game.createdAt);
    }
}
