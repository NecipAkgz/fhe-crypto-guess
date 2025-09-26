import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "@/constants/fhevm";

// Remove unused import that's causing type conflicts
// import type { FHEGuessingGame } from "@/types/contracts";

// Contract ABI - simplified for demo
const FHE_GUESSING_GAME_ABI = [
  {
    "inputs": [],
    "name": "startGame",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "gameId", "type": "uint256"},
      {"internalType": "bytes", "name": "guess", "type": "bytes"},
      {"internalType": "bytes", "name": "guessProof", "type": "bytes"}
    ],
    "name": "makeGuess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
    "name": "getResult",
    "outputs": [
      {"internalType": "bytes", "name": "won", "type": "bytes"},
      {"internalType": "bytes", "name": "revealedChoice", "type": "bytes"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "gameId", "type": "uint256"}],
    "name": "getGameInfo",
    "outputs": [
      {"internalType": "address", "name": "player", "type": "address"},
      {"internalType": "enum FHEGuessingGame.GameState", "name": "state", "type": "uint8"},
      {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
    "name": "getPlayerGames",
    "outputs": [{"internalType": "uint256[]", "name": "gameIds", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const getContract = (signer: ethers.Signer) => {
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    FHE_GUESSING_GAME_ABI,
    signer
  );

  return contract;
};

export const getGameInfo = async (signer: ethers.Signer, gameId: number) => {
  const contract = getContract(signer);
  const [player, state, createdAt] = await contract.getGameInfo(gameId);
  return { player, state, createdAt };
};

export const getPlayerGames = async (signer: ethers.Signer, player: string) => {
  const contract = getContract(signer);
  const gameIds = await contract.getPlayerGames(player);
  return gameIds;
};
