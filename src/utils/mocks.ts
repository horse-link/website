import { ethers } from "ethers";
import { Bet, BetResult } from "../types/subgraph";
import { Back } from "../types/meets";
import { SignedBetDataResponse } from "../types/bets";
import { Meet, Race, RaceStatus } from "horselink-sdk";

export const getMockBet = (): Bet => ({
  id: `BET_${ethers.ZeroAddress}_0`,
  propositionId: ethers.ZeroHash,
  marketId: ethers.ZeroHash,
  asset: ethers.ZeroAddress,
  amount: 0n,
  payout: 0n,
  payoutAt: 30 * 60,
  market: ethers.ZeroAddress,
  owner: ethers.ZeroAddress,
  recipient: ethers.ZeroAddress,
  settled: false,
  result: BetResult.INPLAY,
  createdAt: 0,
  settledAt: 0,
  createdAtTx: ethers.ZeroHash,
  settledAtTx: ethers.ZeroHash,
  refunded: false
});

export const getRealExampleMockBet = (): Bet => ({
  id: "BET_0xb5ee5025c830333faec0c0edc3d1c3be2e85e331_217",
  propositionId: "0x30313933383943425930315730370000",
  marketId: "0x30313933383943425930310000000000",
  market: "0xb5ee5025c830333faec0c0edc3d1c3be2e85e331",
  asset: "0xf9f36c66854010d61e8f46f9cc46f9ed55996229",
  amount: ethers.parseEther("2"),
  payout: ethers.parseEther("16.268426"),
  payoutAt: 1675226100,
  owner: "0x042bc2d085c0584bd56d62c170c4679e1ee9fc45",
  recipient: "0xb5ee5025c830333faec0c0edc3d1c3be2e85e331",
  settled: false,
  result: BetResult.INPLAY,
  settledAt: 0,
  createdAt: 1675223604,
  createdAtTx:
    "0x3198be23014251a9e11b91cc5fd3a1b55cb716bde2e314a6ad5d4bdb35ce5f78",
  settledAtTx:
    "0x123e7bbc64fc50f88c1852edcf29846a7a56ad60b5450a92249a06192c18b8e3",
  refunded: false
});

export const getMockSignedBetDataResponse = (): SignedBetDataResponse => ({
  marketResultAdded: false,
  scratchedRunners: [
    {
      b16propositionId: "0x30313933383943425930315730370000",
      odds: 1,
      totalOdds: "80040337",
      marketResultAdded: false,
      signature: {
        v: 28,
        r: "0xa49e1e507cbd260d40a5ad0c47dffc3b79ed0acfd316a4ef5dddcbc19a75ea58",
        s: "0x2dc06cfb7786974aa5f9bd73cc4e188776809ade82ea9be103a74fbac8c24d28"
      }
    },
    {
      b16propositionId: "0x30313933383943425930315730370069",
      odds: 1,
      totalOdds: "80040369",
      marketResultAdded: true
    }
  ]
});

export const getMockUser = () => ({
  id: ethers.ZeroAddress,
  totalDeposited: 0n,
  inPlay: 0n,
  pnl: 0n,
  lastUpdate: 0
});

export const getMockBack = (): Back => ({
  nonce: "0",
  proposition_id: "",
  market_id: "",
  odds: 0,
  close: 0,
  end: 0,
  signature: { r: "", s: "", v: 0 }
});

export const getMockRunners = () => Array.from({ length: 5 }, () => undefined);

export const getMockAddresses = () =>
  Array.from({ length: 5 }, () => ethers.ZeroAddress);

export const getMockRaces = (length?: number): Race[] =>
  Array.from({ length: length ?? 15 }, (_, i) => ({
    number: i,
    name: "",
    status: RaceStatus.NORMAL,
    distance: 1000,
    hasOdds: true
    // results: [9, 1, 2, 7]
  }));

export const getMockMeets = (): Meet[] =>
  Array.from({ length: 5 }, (_, i) => ({
    id: `mock${i}`,
    name: "",
    location: "",
    date: "",
    races: getMockRaces()
  }));

export const getMockVaultTableRows = () =>
  Array.from({ length: 4 }, () => undefined);

export const getMockBetHistory = () =>
  Array.from({ length: 5 }, () => undefined);

export const getMockLeaderboardStats = () =>
  Array.from({ length: 10 }, () => undefined);
