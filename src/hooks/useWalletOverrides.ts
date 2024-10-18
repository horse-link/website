import { useEffect, useRef, useState } from "react";
import { useAccount, useConnect, useSwitchChain, useConfig } from "wagmi";
import { LOCAL_WALLET_ID } from "../constants/wagmi";
import { useApiWithForce } from "../providers/Api";
import { useApolloWithForce } from "../providers/Apollo";
import { useLocation } from "react-router-dom";
import constants from "../constants";
import { useFirstRender } from "./useFirstRender";
import { CHAINS } from "../constants/blockchain";
import { LAST_KNOWN_LS_KEY } from "./useLocalWallet";
import { arbitrum, Chain } from "viem/chains";

// beware all ye whom enter
// here lie the dreaded overrides
// to slay the plethora of dragons wagmi spawns

export const useWalletOverrides = () => {
  const { chain } = useAccount();
  const chainId = chain?.id;
  const { connectAsync, connectors } = useConnect();
  const { isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const config = useConfig();
  const { forceNewChain: forceApi } = useApiWithForce();
  const { forceNewChain: forceApollo } = useApolloWithForce();
  const { pathname } = useLocation();
  const isFirstRender = useFirstRender();

  const isLocalWallet = false; //= connector?.id === LOCAL_WALLET_ID;
  const isChainUnsupported = !config.chains.some(chain => chain.id === chainId);
  const isUnsupportedPage = pathname === "/unsupported";

  const [isLoading, setLoading] = useState(false);

  // network intent
  const networkIntent = useRef<Chain>(constants.blockchain.CHAINS[0]);

  const forceNewNetwork = async (chain: Chain) => {
    if (isUnsupportedPage || isLoading) return;

    try {
      networkIntent.current = chain;

      // write to LS
      localStorage.setItem(LAST_KNOWN_LS_KEY, chain.id.toString());

      await switchChainAsync({ chainId: chain.id });
      forceApi(chain);
      forceApollo(chain);
    } catch (e) {
      console.error(e);

      networkIntent.current = constants.blockchain.CHAINS[0];
      localStorage.setItem(LOCAL_WALLET_ID, arbitrum.id.toString());
    }
  };

  // run on page load
  useEffect(() => {
    // was there a last known chain
    const lastKnown = localStorage.getItem(LAST_KNOWN_LS_KEY);
    if (!lastKnown) return;
    const chain = CHAINS.find(c => c.id === +lastKnown);
    if (!chain) return;

    forceNewNetwork(chain);
  }, []);

  // if the user ever disconnects
  useEffect(() => {
    if (!!isConnected) return;

    const localConnector = connectors.find(c => c.id === LOCAL_WALLET_ID);
    if (localConnector) {
      forceNewNetwork(arbitrum);
      connectAsync({ connector: localConnector }).catch(error => {
        console.error("Failed to connect:", error);
      });
    }
  }, [isConnected, connectors, connectAsync]);

  // if the chain switches
  useEffect(() => {
    if (!chain) return;

    networkIntent.current = chain;
  }, [chain]);

  // if the user switches connectors
  const storeIntent = useRef<Chain>(networkIntent.current);
  useEffect(() => {
    if (isFirstRender) return;

    if (!isLoading) {
      // while not loading (finished loading, we check to see what the current chain vs old intent is)
      if (storeIntent.current.id !== chain?.id)
        forceNewNetwork(storeIntent.current);

      return;
    }

    // while loading we store the old intent
    storeIntent.current = networkIntent.current;
  }, [isLoading]);

  // if the user rejects the chain switch
  // useEffect(() => {
  //   if (!chain) return;

  //   networkIntent.current = chain;
  // }, [isError]);

  return {
    isLocalWallet,
    forceNewNetwork,
    isChainUnsupported,
    isUnsupportedPage,
    setLoading
  };
};
