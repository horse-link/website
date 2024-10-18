import React, { createContext, useContext, useMemo, useState } from "react";
import { Api } from "../apis/Api";
import constants from "../constants";
import { Network } from "../types/general";
import { ApiContextType } from "../types/context";
import { useAccount } from "wagmi";

// use placeholder default chain -- has no effect
export const ApiContext = createContext<ApiContextType>({
  api: new Api(constants.blockchain.CHAINS[0]),
  chain: constants.blockchain.CHAINS[0],
  forceNewChain: () => {}
});

// most common use case
export const useApi = () => useContext(ApiContext).api;

// expanded context
export const useApiWithForce = () => useContext(ApiContext);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { chain: currentChain } = useAccount();
  const [chain, setChain] = useState(currentChain);

  const forceNewChain = (newChain: Network) => setChain(newChain);

  const value = useMemo(
    () => ({
      api: new Api(chain || constants.blockchain.CHAINS[0]),
      chain,
      forceNewChain
    }),
    [chain, forceNewChain]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
