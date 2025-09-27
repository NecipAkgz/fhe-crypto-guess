// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

let fhevmInstance: Awaited<ReturnType<typeof import('@zama-fhe/relayer-sdk/bundle').createInstance>> | null = null;
let isInitialized = false;
let hasFailed = false;

export const initFhevm = async () => {
  if (isInitialized && fhevmInstance) {
    return fhevmInstance;
  }

  if (hasFailed) {
    throw new Error("FHEVM initialization previously failed");
  }

  try {
    console.log("Initializing FHEVM SDK...");

    // Dynamic import for client-side only
    const { initSDK, createInstance, SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');

    // Initialize WASM SDK
    await initSDK();

    if (!window.ethereum) {
      throw new Error("Ethereum provider not detected, please install MetaMask.");
    }

    // Switch to or add Sepolia
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code?: number; message?: string };
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia",
              nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        console.warn("Failed to switch network, may already be on another network:", switchError);
      }
    }

    // Create FHEVM instance with Sepolia config
    const config = { ...SepoliaConfig, network: window.ethereum };
    fhevmInstance = await createInstance(config);

    isInitialized = true;
    console.log("✅ FHEVM SDK initialization completed");

    return fhevmInstance;
  } catch (error) {
    console.error("❌ FHEVM SDK initialization failed:", error);
    hasFailed = true;
    throw error;
  }
};

export const getFhevmConfig = async (network: string) => {
  console.log(`Getting FHEVM config for ${network}`);
  return {
    publicKey: "0x" + "00".repeat(32),
    gatewayUrl: "https://api.fhevm.dev"
  };
};

export const isFhevmReady = (): boolean => {
  return isInitialized && fhevmInstance !== null;
};

export const hasFhevmFailed = (): boolean => {
  return hasFailed;
};
