import { render } from "@testing-library/react";
import { ApolloProvider } from "../providers/Apollo";
import { WalletModalProvider } from "../providers/WalletModal";
import { http, createConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { metaMask, walletConnect } from "wagmi/connectors";

const config = createConfig({
  chains: [sepolia],
  connectors: [
    metaMask(),
    walletConnect({ projectId: "YOUR_PROJECT_ID" }) // Replace with your WalletConnect project ID
  ],
  transports: {
    [sepolia.id]: http()
  }
});

const queryClient = new QueryClient();

const BaseProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletModalProvider>
          <ApolloProvider>{children}</ApolloProvider>
        </WalletModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: BaseProviders,
    ...options
  });

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
// override render export
export { customRender as render };
