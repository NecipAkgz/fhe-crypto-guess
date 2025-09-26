// Service status checker for FHEVM and other external services
export const checkFhevmStatus = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch("https://api.fhevm.dev/sepolia/public-key", {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log("FHEVM service check failed:", error);
    return false;
  }
};

export const checkContractStatus = async (contractAddress: string): Promise<boolean> => {
  try {
    // Simple check if contract exists on Sepolia
    const response = await fetch(`https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=demo`);
    const data = await response.json();
    return data.status === "1";
  } catch (error) {
    console.log("Contract status check failed:", error);
    return false;
  }
};

export type ServiceStatus = {
  fhevm: boolean;
  contract: boolean;
  demoMode: boolean;
};

export const checkAllServices = async (contractAddress: string): Promise<ServiceStatus> => {
  const [fhevm, contract] = await Promise.all([
    checkFhevmStatus(),
    checkContractStatus(contractAddress)
  ]);

  const demoMode = !fhevm || !contract;

  return {
    fhevm,
    contract,
    demoMode
  };
};
