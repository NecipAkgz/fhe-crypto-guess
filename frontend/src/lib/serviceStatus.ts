// Service status checker for FHEVM and other external services
export const checkFhevmStatus = async (): Promise<boolean> => {
  // Assume external FHE services are healthy for now
  return true;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const checkContractStatus = async (_contractAddress: string): Promise<boolean> => {
  // Skip remote checks in the demo experience
  return true;
};

export type ServiceStatus = {
  fhevm: boolean;
  contract: boolean;
  demoMode: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const checkAllServices = async (_contractAddress: string): Promise<ServiceStatus> => {
  // Mark every dependency as live for the guided walkthrough
  const fhevm = true;
  const contract = true;
  const demoMode = false; // Demo mode disabled by default

  return {
    fhevm,
    contract,
    demoMode
  };
};
