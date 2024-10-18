import { MarketHistoryType } from "horselink-sdk";
import { Address, Hash } from "viem";

export type MarketHistory = {
  id: Hash; // tx id
  vaultAddress: Address;
  amount: bigint;
  type: MarketHistoryType;
  createdAt: number;
};
