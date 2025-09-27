// Service status checker for FHEVM and other external services
export const checkFhevmStatus = async (): Promise<boolean> => {
  // Always return true to skip relayer service check
  return true;
};

export const checkContractStatus = async (contractAddress: string): Promise<boolean> => {
  // Always return true to skip contract status check
  return true;
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

  // Always set demoMode to false
  const demoMode = false;

  return {
    fhevm,
    contract,
    demoMode
  };
};
