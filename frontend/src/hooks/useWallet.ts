import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask } from "wagmi/connectors";

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = () => {
    connect({ connector: metaMask() });
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnect
  };
};
