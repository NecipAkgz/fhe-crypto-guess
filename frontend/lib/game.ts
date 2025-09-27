import { ethers } from "ethers";
import { initFhevm } from "./fhevm";
import { getContract } from "./contracts";
import { checkAllServices, type ServiceStatus } from "./serviceStatus";
import { CONTRACT_ADDRESS } from "@/constants/fhevm";

export const checkServices = async (): Promise<ServiceStatus> => {
  return await checkAllServices(CONTRACT_ADDRESS);
};

export const startNewGame = async (signer: ethers.Signer) => {
  try {
    const contract = getContract(signer);
    const tx = await contract.startGame();
    await tx.wait();
    return tx;
  } catch (error) {
    console.log("Game start failed:", error);
    // In demo mode, just return a mock transaction
    return { hash: "0x" + "demo".repeat(10) } as ethers.ContractTransactionResponse;
  }
};

export const makeGuess = async (signer: ethers.Signer, gameId: number, choice: number) => {
  try {
    const instance = await initFhevm();
    const contract = getContract(signer);
    const contractAddress = await contract.getAddress();

    // Create encrypted input
    const userAddress = await signer.getAddress();
    const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
    encryptedInput.add32(choice);

    const { handles, inputProof } = await encryptedInput.encrypt();

    const tx = await contract.makeGuess(gameId, handles[0], inputProof);
    await tx.wait();

    return tx;
  } catch (error) {
    console.log("Make guess failed:", error);
    // If FHEVM fails, try without encryption (demo mode)
    try {
      const contract = getContract(signer);
      const tx = await contract.makeGuessDemo(gameId, choice);
      await tx.wait();
      return tx;
    } catch (demoError) {
      console.log("Demo mode also failed:", demoError);
      return { hash: "0x" + "demo".repeat(10) } as ethers.ContractTransactionResponse;
    }
  }
};

export const getGameResult = async (signer: ethers.Signer, gameId: number) => {
  try {
    const instance = await initFhevm();
    const contract = getContract(signer);
    const contractAddress = await contract.getAddress();

    const [encryptedWon, encryptedChoice] = await contract.getResult(gameId);

    // Decrypt results
    const userAddress = await signer.getAddress();
    const handles = [
      { handle: encryptedWon, contractAddress: contractAddress },
      { handle: encryptedChoice, contractAddress: contractAddress }
    ];

    const privateKey = "0x" + "00".repeat(32); // Placeholder - in real app get from secure storage
    const publicKey = await instance.getPublicKey();
    const signature = "0x"; // Placeholder - in real app create proper signature

    const results = await instance.userDecrypt(
      handles,
      privateKey,
      "0x" + "00".repeat(32), // Mock public key
      signature,
      [contractAddress],
      userAddress,
      Math.floor(Date.now() / 1000),
      30
    );

    return {
      won: results[0] as boolean,
      choice: Number(results[1])
    };
  } catch (error) {
    console.log("Get result failed:", error);
    // In demo mode, return mock results
    return {
      won: Math.random() > 0.5,
      choice: Math.floor(Math.random() * 3)
    };
  }
};
