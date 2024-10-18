import { VaultInfo } from "horselink-sdk";
import { Address } from "viem";

export type ProtocolAddresses = {
  registry: Address;
  marketOracle: Address;
  ownerAddress: Address;
};

export type TokenInfo = {
  name: string;
  symbol: string;
  address: Address;
  decimals: number;
  owner: Address;
  totalSupply: bigint;
};

export type MarketInfo = {
  owner: Address;
  address: Address;
  fee: bigint;
  inPlayCount: bigint;
  totalExposure: bigint;
  totalInPlay: bigint;
  vaultAddress: Address;
};

// export type VaultInfo = {
//   name: string;
//   address: Address;
//   owner: Address;
//   asset: TokenInfo;
//   marketAddress: Address;
//   performance: BigNumber;
//   totalAssets: BigNumber;
//   totalSupply: BigNumber;
//   totalAssetsLocked: BigNumber;
//   userAssetTotal?: BigNumber;
//   userShareTotal?: BigNumber;
//   userSharePercentage?: string;
// };

export type Config = {
  addresses: ProtocolAddresses;
  markets: MarketInfo[];
  vaults: VaultInfo[];
  tokens: TokenInfo[];
  locations: Record<string, string>;
};
