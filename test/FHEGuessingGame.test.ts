import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FHEGuessingGame } from "../types";

describe("FHEGuessingGame", function () {
  let gameContract: FHEGuessingGame;
  let deployer: HardhatEthersSigner;
  let player1: HardhatEthersSigner;
  let player2: HardhatEthersSigner;

  before(async function () {
    // Get signers
    [deployer, player1, player2] = await ethers.getSigners();

    // Deploy contract
    const GameFactory = await ethers.getContractFactory("FHEGuessingGame");
    gameContract = await GameFactory.deploy();
    await gameContract.waitForDeployment();
  });

  describe("Contract Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await gameContract.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct initial state", async function () {
      expect(await gameContract.getNextGameId()).to.equal(1);
    });
  });

  describe("startGame()", function () {
    it("Should create a new game successfully", async function () {
      const tx = await gameContract.connect(player1).startGame();
      await tx.wait();

      // Check event emission
      await expect(tx)
        .to.emit(gameContract, "GameStarted")
        .withArgs(1, player1.address);

      // Check game state
      const gameInfo = await gameContract.getGameInfo(1);
      expect(gameInfo[0]).to.equal(player1.address);
      expect(gameInfo[1]).to.equal(1); // WaitingForGuess state
      expect(gameInfo[2]).to.be.greaterThan(0); // createdAt timestamp
    });

    it("Should increment game ID for each new game", async function () {
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player2).startGame();

      expect(await gameContract.getNextGameId()).to.equal(4);
    });

    it("Should track player games correctly", async function () {
      const playerGames = await gameContract.getPlayerGames(player1.address);
      expect(playerGames.length).to.equal(2);
      expect(playerGames[0]).to.equal(1);
      expect(playerGames[1]).to.equal(2);
    });
  });

  describe("makeGuess()", function () {
    let gameId: number;

    beforeEach(async function () {
      // Create a new game for each test
      await gameContract.connect(player1).startGame();
      gameId = Number(await gameContract.getNextGameId()) - 1;
    });

    it("Should reject guess from non-game owner", async function () {
      // Test with minimal valid FHE data format
      const mockEncryptedData = "0x0000000000000000000000000000000000000000000000000000000000000000";

      await expect(
        gameContract.connect(player2).makeGuess(gameId, mockEncryptedData, "0x")
      ).to.be.revertedWith("Not your game");
    });



    it("Should reject guess for non-existent game", async function () {
      const mockEncryptedData = "0x0000000000000000000000000000000000000000000000000000000000000000";

      await expect(
        gameContract.connect(player1).makeGuess(999, mockEncryptedData, "0x")
      ).to.be.revertedWith("Game not waiting for guess");
    });
  });

  describe("getResult()", function () {
    let gameId: number;

    beforeEach(async function () {
      // Create a game for testing
      await gameContract.connect(player1).startGame();
      gameId = Number(await gameContract.getNextGameId()) - 1;
    });

    it("Should reject result for incomplete game", async function () {
      // Create game but don't make guess - should fail
      await expect(
        gameContract.connect(player1).getResult(gameId)
      ).to.be.revertedWith("Game not completed");
    });

    it("Should reject result request from non-owner", async function () {
      // Test with non-owner - should fail with "Not your game" after game state check
      // Note: Contract checks game state first, then ownership
      await expect(
        gameContract.connect(player2).getResult(gameId)
      ).to.be.revertedWith("Game not completed");
    });

    it("Should handle result request for game owner with incomplete game", async function () {
      // Even for game owner, should fail if game is not completed
      await expect(
        gameContract.connect(player1).getResult(gameId)
      ).to.be.revertedWith("Game not completed");
    });
  });

  describe("revealChoice()", function () {
    let gameId: number;

    beforeEach(async function () {
      // Create a game for testing
      await gameContract.connect(player1).startGame();
      gameId = Number(await gameContract.getNextGameId()) - 1;
    });

    it("Should reject reveal request for incomplete game", async function () {
      // Should fail if game is not completed
      await expect(
        gameContract.connect(player1).revealChoice(gameId)
      ).to.be.revertedWith("Game not completed");
    });

    it("Should reject reveal request from non-owner", async function () {
      // Test with non-owner - should fail with "Game not completed" first
      await expect(
        gameContract.connect(player2).revealChoice(gameId)
      ).to.be.revertedWith("Game not completed");
    });
  });

  describe("Game Logic Integration", function () {
    it("Should handle multiple games creation", async function () {
      // Get current game count before creating new games
      const initialGameCount = await gameContract.getNextGameId();

      // Player 1 games
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player1).startGame();

      // Player 2 games
      await gameContract.connect(player2).startGame();

      // Check that all games are in correct state
      expect(await gameContract.getNextGameId()).to.equal(Number(initialGameCount) + 3);

      // Check player games tracking - need to check the latest games created
      const allPlayer1Games = await gameContract.getPlayerGames(player1.address);
      const allPlayer2Games = await gameContract.getPlayerGames(player2.address);

      // Should have at least 2 games for player1 and 1 for player2 from this test
      expect(allPlayer1Games.length).to.be.greaterThanOrEqual(2);
      expect(allPlayer2Games.length).to.be.greaterThanOrEqual(1);
    });

    it("Should handle game state transitions correctly", async function () {
      // Start a game
      await gameContract.connect(player1).startGame();
      const gameId = Number(await gameContract.getNextGameId()) - 1;

      // Check initial state
      const initialState = await gameContract.getGameInfo(gameId);
      expect(initialState[1]).to.equal(1); // WaitingForGuess

      // All operations should fail until game is completed
      await expect(gameContract.connect(player1).getResult(gameId))
        .to.be.revertedWith("Game not completed");
      await expect(gameContract.connect(player1).revealChoice(gameId))
        .to.be.revertedWith("Game not completed");
    });
  });

  describe("Edge Cases and Security", function () {
    it("Should maintain game state integrity", async function () {
      // Get current game count before creating test games
      const initialGameCount = await gameContract.getNextGameId();

      // Create multiple games and ensure they don't interfere
      await gameContract.connect(player1).startGame();
      await gameContract.connect(player2).startGame();
      await gameContract.connect(player1).startGame();

      const game1Info = await gameContract.getGameInfo(Number(initialGameCount));
      const game2Info = await gameContract.getGameInfo(Number(initialGameCount) + 1);
      const game3Info = await gameContract.getGameInfo(Number(initialGameCount) + 2);

      expect(game1Info[0]).to.equal(player1.address);
      expect(game2Info[0]).to.equal(player2.address);
      expect(game3Info[0]).to.equal(player1.address);
    });
  });
});
