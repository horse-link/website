import { VaultTransaction } from "./vaults";
import { Address, Hash } from "viem";

export type SubgraphValues = string | number | boolean;

export type Subgraphable<T extends string> =
  | T
  | `${T}_gt`
  | `${T}_lt`
  | `${T}_gte`
  | `${T}_lte`;

export type SubgraphKeys =
  | Subgraphable<keyof Aggregator>
  | Subgraphable<keyof Registry>
  | Subgraphable<keyof Bet>
  | Subgraphable<keyof VaultTransaction>
  | Subgraphable<keyof Borrow>
  | Subgraphable<keyof Repay>;

export type SubgraphFilter = Partial<Record<SubgraphKeys, SubgraphValues>>;

export type Aggregator = {
  // id will always be aggregator
  id: "aggregator";

  totalBets: number;
  totalMarkets: number;
  totalVaults: number;
};

export type Registry = {
  // id will always be registry
  id: "registry";

  markets: Array<Address>;
  vaults: Array<Address>;
};

// bet id will be BET_<MARKET_ADDRESS>_<BET_NUMBER>
export type BetId = `BET_${Address}_${number}`;

// shadowed from contracts
export const enum BetResult {
  INPLAY,
  WINNER,
  LOSER,
  SCRATCHED
}

export type Bet = {
  id: BetId;
  asset: Address;
  payoutAt: number;
  market: Address;
  marketId: string;
  propositionId: string;
  amount: bigint;
  payout: bigint;
  owner: Address;
  createdAt: number;
  createdAtTx: Hash;
  settled: boolean;
  result: BetResult;
  recipient: Address;
  settledAt: number;
  settledAtTx: Hash;
  refunded: boolean;
};

// leave these in for backwards compatibility
export type Deposit = {
  id: Hash;
  vault: Address;
  sender: Address;
  owner: Address;
  assets: bigint;
  shares: bigint;
  createdAt: number;
};

export type Withdraw = {
  id: Hash;
  vault: Address;
  sender: Address;
  receiver: Address;
  owner: Address;
  assets: bigint;
  shares: bigint;
  createdAt: number;
};

export type Borrow = {
  id: Hash;
  vaultAddress: Address;
  betIndex: number;
  amount: bigint;
};

export type Repay = {
  id: Hash;
  vaultAddress: Address;
  amount: bigint;
};
