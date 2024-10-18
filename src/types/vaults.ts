import { VaultInfo } from "horselink-sdk";
import { AddressString, HashString } from "./subgraph";

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
  id: HashString;
  type: VaultTransactionType;
  vaultAddress: AddressString; // "0x${string}"
  userAddress: AddressString; // "0x${string}"
  amount: bigint;
  timestamp: number;
};

export type VaultHistory = {
  type: VaultTransactionType;
  amount: bigint;
  createdAt: number;
  vaultAddress: AddressString; // "0x${string}"
  tx: HashString;
}[];
