import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import React, { createContext, useContext, useMemo, useState } from "react";
import constants from "../constants";
// import { useNetwork } from "wagmi";
import { ApolloContextType } from "../types/context";
import { Network } from "../types/general";
import { useAccount } from "wagmi";

const ApolloContext = createContext<ApolloContextType>({
  client: new ApolloClient({
    link: new HttpLink({
      uri: constants.env.SUBGRAPH_URL,
      fetch
    }),
    cache: new InMemoryCache()
  }),
  chain: constants.blockchain.CHAINS[0],
  forceNewChain: () => {}
});

// most common use case
export const useApolloContext = () => useContext(ApolloContext).client;

// expanded context
export const useApolloWithForce = () => useContext(ApolloContext);

export const ApolloProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { chain: currentChain } = useAccount();

  const [chain, setChain] = useState(currentChain);

  const rawSuffix =
    chain?.name.toLowerCase() ||
    constants.blockchain.CHAINS[0].name.toLowerCase();
  // strip out extra words
  const suffix = rawSuffix.split(" ")[0].toLowerCase();

  const forceNewChain = (newChain: Network) => setChain(newChain);

  const client = useMemo(
    () => ({
      client: new ApolloClient({
        link: new HttpLink({
          uri: `${constants.env.SUBGRAPH_URL}-${suffix}`,
          fetch
        }),
        cache: new InMemoryCache()
      }),
      chain,
      forceNewChain
    }),
    [suffix, chain, forceNewChain]
  );

  return (
    <ApolloContext.Provider value={client}>{children}</ApolloContext.Provider>
  );
};
