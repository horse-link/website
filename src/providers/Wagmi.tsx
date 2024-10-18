import { createConfig, WagmiProvider } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { walletConnect } from "wagmi/connectors";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import constants from "../constants";
import { useHorseLinkConnector } from "../hooks/useHorseLinkConnector";

const config = createConfig({
  chains: constants.blockchain.CHAINS,
  transports: Object.fromEntries(
    constants.blockchain.CHAINS.map(chain => [
      chain.id,
      http(`${constants.env.RPC_URL}`)
    ])
  ),
  connectors: [
    metaMask(),
    walletConnect({
      projectId: "YOUR_PROJECT_ID", // Replace with your WalletConnect project ID
      showQrModal: true
    })
    // HorseLinkWallet will be added dynamically
  ]
});

const queryClient = new QueryClient();

export const CustomWagmiProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const horseLinkWallet = useHorseLinkConnector(constants.blockchain.CHAINS);

  // Dynamically add the HorseLinkWallet connector
  config.connectors.push(horseLinkWallet);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
