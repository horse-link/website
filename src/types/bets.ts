import { ERC20, Market } from "../typechain";
import { EcSignature } from "./general";
import { BackParams } from "./meets";
import { Address, Hash } from "viem";

export type ScratchedRunner = {
  b16propositionId: string;
  odds: number;
  totalOdds: string;
  marketResultAdded: boolean;
  signature?: EcSignature;
};

export type SignedBetDataResponse = {
  marketResultAdded: boolean;
  winningPropositionId?: string;
  marketOracleResultSig?: EcSignature;
  scratchedRunners?: ScratchedRunner[];
};

export type BetTablePaginationValues = 25 | 50 | 100;

export type BetResult = "WIN" | "LOSE" | "PENDING";

export type BetStatus =
  | "RESULTED"
  | "PENDING"
  | "SCRATCHED"
  | "SETTLED"
  | "INVALID"
  | "REFUNDED";

export type BetFilterOptions = "ALL_BETS" | BetStatus;

export type BetHistoryResponse = {
  results: BetHistory[];
};

export type BetHistory = {
  index: number;
  marketId: string;
  market: string;
  assetAddress: string;
  propositionId: string;
  marketResultAdded: boolean;
  settled: boolean;
  punter: string;
  amount: string;
  payout: string;
  payoutDate: number;
  blockNumber: number;
  settledAt?: number;
  settledAtTx?: string;
  winningPropositionId?: string;
  marketOracleResultSig?: EcSignature;
  scratched?: ScratchedRunner;
  status: BetStatus;
  tx: string;
};

// TODO: remove old type once full transition complete
export type BetHistoryResponse2 = {
  index: number; // bet index
  punter: Address; // address of punter
  amount: string; // raw ether amount (always ether as it comes direct from subgraph)
  payout: string; // potential payout of the bet
  asset: Address; // address of asset
  time: number; // timestamp
  race: string; // full text race name
  propositionId: string; // propositionId as bytes16
  proposition: string; // english "Horse 0 Win"
  status: BetStatus;
  result: BetResult; // won or lost
  tx: Hash; // tx id
  settledAtTx: Hash; // tx id for settled
};

export type SignedBetHistoryResponse2 = BetHistoryResponse2 &
  SignedBetDataResponse & {
    scratched?: ScratchedRunner;
  };

export type TotalBetsOnPropositions = Record<
  string,
  {
    amount: string;
    percentage: number;
  }
>;

export type BetTotals = Record<
  string,
  {
    symbol: string;
    payout: bigint;
    stake: bigint;
  }
>;

// All info needed to process a multibet
export type MarketMultiBetInfo = {
  tokenContract: ERC20;
  marketContract: Market;
  assetAddress: string;
  allowance: bigint;
  totalWagers: bigint;
  backs: BackParams[];
};
