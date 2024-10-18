import { createConfig, WagmiProvider } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { walletConnect } from "wagmi/connectors";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import constants from "../constants";
import { arbitrum, sepolia } from "wagmi/chains";
//import { horseLinkWalletConnector } from "../constants/wagmi";
//import { useLocalWallet } from "../hooks/useLocalWallet";

// interface HorseLinkWalletOptions {
//   wallet: ReturnType<typeof useLocalWallet>;
//   //chains: Chain[];
// }

const config = createConfig({
  chains: [arbitrum, sepolia],
  transports: {
    [arbitrum.id]: http(`${constants.env.RPC_URL}`),
    [sepolia.id]: http(`${constants.env.RPC_URL}`)
  },
  connectors: [
    metaMask(),
    walletConnect({
      projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect project ID
      showQrModal: true
    })
    // horseLinkWalletConnector({
    //   wallet: useLocalWallet([arbitrum, sepolia]),
    //   //chains: [arbitrum, sepolia]
    // } as HorseLinkWalletOptions)
  ]
});

const queryClient = new QueryClient();

export const CustomWagmiProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  // const horseLinkWallet = useHorseLinkConnector(constants.blockchain.CHAINS);
  // Dynamically add the HorseLinkWallet connector
  // config.connectors.push(horseLinkWallet);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
