import { VaultInfo } from "horselink-sdk";
import { Address, Hash } from "viem";

export type Vault = {
  name: string;
  symbol: string;
  totalAssets: string;
  address: string;
};

export type VaultUserData = {
  percentage: string;
  userShareBalance: bigint;
  userAssetBalance: bigint;
};

export enum VaultTransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  BORROW = "borrow",
  REPAY = "repay"
}

export type VaultModalState = {
  type: VaultTransactionType;
  vault: VaultInfo;
};

export type VaultTransaction = {
  id: Hash;
  type: VaultTransactionType;
  vaultAddress: Address;
  userAddress: Address;
  amount: bigint;
  timestamp: number;
};

export type VaultHistory = {
  type: VaultTransactionType;
  amount: bigint;
  createdAt: number;
  vaultAddress: Address;
  tx: Hash;
}[];
