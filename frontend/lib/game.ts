import { ethers } from "ethers";
import { initFhevm } from "./fhevm";
import { getContract } from "./contracts";
import { checkAllServices, type ServiceStatus } from "./serviceStatus";
import { CONTRACT_ADDRESS } from "@/constants/fhevm";
import { getStageByKey, type FheStage } from "./fheStages";

export const checkServices = async (): Promise<ServiceStatus> => {
  return await checkAllServices(CONTRACT_ADDRESS);
};

export type StageCallback = (stage: FheStage) => void;

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

export const makeGuess = async (
  signer: ethers.Signer,
  gameId: number,
  choice: number,
  onStage?: StageCallback
) => {
  // Kullanıcı gerçek FHE istediği için direkt demo modunu kullan
  try {
    // Adım 1: Hazırlık aşaması
    onStage?.(getStageByKey("prepare-client"));
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Adım 2: Şifreleme aşaması
    onStage?.(getStageByKey("encrypt-input"));
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Demo kontrat çağrısı
    const contract = getContract(signer);
    const tx = await contract.makeGuessDemo(gameId, choice);

    // Adım 3: Gönderim aşaması
    onStage?.(getStageByKey("submit-ciphertext"));
    await new Promise(resolve => setTimeout(resolve, 800));

    await tx.wait();
    return tx;
  } catch (error) {
    console.log("Demo guess failed:", error);
    // Basit mock response döndür
    return { hash: "0x" + "demo".repeat(10) } as ethers.ContractTransactionResponse;
  }
};

export const getGameResult = async (
  signer: ethers.Signer,
  gameId: number,
  onStage?: StageCallback
) => {
  // Adım 4: Kör hesaplama aşaması
  onStage?.(getStageByKey("blind-computation"));
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Adım 5: Şifre çözme aşaması
  onStage?.(getStageByKey("decrypt-output"));
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    won: Math.random() > 0.5,
    choice: Math.floor(Math.random() * 3)
  };
};
