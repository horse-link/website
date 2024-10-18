import { VaultTransaction } from "./vaults";

export type AddressString = string;
export type HashString = string;

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

  markets: Array<AddressString>;
  vaults: Array<AddressString>;
};

// bet id will be BET_<MARKET_ADDRESS>_<BET_NUMBER>
export type BetId = `BET_${AddressString}_${number}`;

// shadowed from contracts
export const enum BetResult {
  INPLAY,
  WINNER,
  LOSER,
  SCRATCHED
}

export type Bet = {
  id: BetId;
  asset: AddressString;
  payoutAt: number;
  market: AddressString;
  marketId: string;
  propositionId: string;
  amount: bigint;
  payout: bigint;
  owner: AddressString;
  createdAt: number;
  createdAtTx: HashString;
  settled: boolean;
  result: BetResult;
  recipient: AddressString;
  settledAt: number;
  settledAtTx: HashString;
  refunded: boolean;
};

// leave these in for backwards compatibility
export type Deposit = {
  id: HashString;
  vault: AddressString;
  sender: AddressString;
  owner: AddressString;
  assets: bigint;
  shares: bigint;
  createdAt: number;
};

export type Withdraw = {
  id: HashString;
  vault: AddressString;
  sender: AddressString;
  receiver: AddressString;
  owner: AddressString;
  assets: bigint;
  shares: bigint;
  createdAt: number;
};

export type Borrow = {
  id: HashString;
  vaultAddress: AddressString;
  betIndex: number;
  amount: bigint;
};

export type Repay = {
  id: HashString;
  vaultAddress: AddressString;
  amount: bigint;
};
