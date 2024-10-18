import Navigation from "./Navigation";
import { CustomWagmiProvider } from "./providers/Wagmi";
import { WalletModalProvider } from "./providers/WalletModal";
import { ApolloProvider } from "./providers/Apollo";
import { ConfigProvider } from "./providers/Config";
import { BetSlipContextProvider } from "./providers/BetSlip";
import { TokenContextProvider } from "./providers/Token";
import { ApiProvider } from "./providers/Api";

const App: React.FC = () => (
  <CustomWagmiProvider>
    <ApiProvider>
      <ConfigProvider>
        <ApolloProvider>
          <WalletModalProvider>
            <BetSlipContextProvider>
              <TokenContextProvider>
                <Navigation />
              </TokenContextProvider>
            </BetSlipContextProvider>
          </WalletModalProvider>
        </ApolloProvider>
      </ConfigProvider>
    </ApiProvider>
  </CustomWagmiProvider>
);

export default App;
