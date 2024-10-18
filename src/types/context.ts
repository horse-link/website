import { MarketInfo } from "./config";
import { Back } from "./meets";
import { Token } from "./tokens";
import { Api } from "../apis/Api";
import { Network } from "./general";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { Signer } from "ethers";
import { Runner } from "horselink-sdk";

export type BetSlipErrorEntry = {
  bet: Omit<BetSlipEntry, "id">;
  errorMessage: string;
};

export type BetEntry = {
  market: MarketInfo;
  back: Back;
  wager: bigint;
  runner: Runner;
  name: string; // name
  number: number; // number
  timestamp: number;
};

export type BetSlipEntry = BetEntry & {
  id: number;
};

export type BetSlipContextType = {
  addBet: (bet: BetEntry) => void;
  addBets: (bet: BetEntry[]) => void;
  bets?: BetSlipEntry[];
  clearBets: () => void;
  errors?: string[];
  forceNewSigner: (signer: Signer) => void;
  hashes?: string[];
  placeBetImmediately: (bet: BetEntry) => Promise<void>;
  placeBetsInBetSlip: () => void;
  removeBet: (id: number) => void;
  txLoading: boolean;
};

export type TokenContextType = {
  currentToken?: Token;
  availableTokens?: Array<Token>;
  tokensLoading: boolean;
  changeToken: (to: Token) => void;
  openModal: () => void;
};

export type ApiContextType = {
  api: Api;
  chain?: Network;
  forceNewChain: (newChain: Network) => void;
};

export type ApolloContextType = {
  client: ApolloClient<NormalizedCacheObject>;
  chain?: Network;
  forceNewChain: (newChain: Network) => void;
};
