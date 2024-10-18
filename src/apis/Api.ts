import axios, { AxiosInstance } from "axios";
import { ethers } from "ethers";
import utils from "../utils";
import { Config } from "../types/config";
import { MeetInfo, MeetResults } from "horselink-sdk";
import { BetHistoryResponse, SignedBetDataResponse } from "../types/bets";
import { Market } from "../typechain";
import { Token } from "graphql";
import { VaultUserData } from "../types/vaults";
import { Network } from "../types/general";
import constants from "../constants";
import { Bet } from "../types/subgraph";
import { MarketHistory } from "../types/markets";
import { VaultInfo } from "horselink-sdk";

import type {
  FormattedProtocol,
  MarketStats,
  SignedMeetingsResponse,
  Runner
} from "horselink-sdk";

export class Api {
  public client: AxiosInstance;

  constructor(network: Network) {
    this.client = this.createAxiosClient(network);
  }

  private createAxiosClient = (network: Network) =>
    axios.create({
      baseURL: constants.env.API_URL,
      headers: {
        Accept: "application/json",
        "chain-id": network.id
      }
    });

  public getConfig = async (): Promise<Config> => {
    const { data } = await this.client.get<Config>("/config");

    return data;
  };

  public getMeetings = async (): Promise<SignedMeetingsResponse> => {
    const { data } = await this.client.get<SignedMeetingsResponse>("/meetings");

    return data;
  };

  // Get all the races for a given meeting
  public getMeeting = async (locationCode: string): Promise<MeetInfo> => {
    const { data } = await this.client.get<MeetInfo>(
      `/meetings/${locationCode}`
    );

    return data;
  };

  public getRaceResult = async (
    propositionId: string
  ): Promise<MeetResults> => {
    const { data } = await this.client.get<MeetResults>(
      `/meetings/results/${propositionId}`
    );
    return data;
  };

  public getMelbourneCupRunners = async () => {
    const { data } = await this.client.get<Runner[]>("/melbournecup");
    return data;
  };

  public getBetHistory = async (): Promise<BetHistoryResponse> => {
    const { data } = await this.client.get("/history");

    return data;
  };

  public getWinningResultSignature = async (
    marketId: string,
    sign: boolean = false
  ): Promise<SignedBetDataResponse> => {
    const { data } = await this.client.get(
      `/bets/market/${marketId}?sign=${sign}`
    );

    return data;
  };

  public getUserBetHistory = async (
    account: string
  ): Promise<BetHistoryResponse> => {
    const { data } = await this.client.get(`/history/${account}`);

    return data;
  };

  public requestTokenFromFaucet = async (
    userAddress: string,
    tokenAddress: string
  ): Promise<{ tx: string }> => {
    const config = await this.getConfig();
    const amount = utils.config.isUsdt(tokenAddress, config)
      ? ethers.parseUnits("100", 6)
      : ethers.parseUnits("100");

    const { data } = await this.client.post(`/faucet`, {
      to: userAddress,
      amount: amount.toString(),
      address: tokenAddress
    });

    return data;
  };

  public getTotalLiquidity = async (): Promise<{ assets: number }> => {
    const { data } = await this.client.get("/vaults/liquidity");
    return data;
  };

  public getVaultHistory = async (): Promise<MarketStats> => {
    const { data } = await this.client.get<MarketStats>("/vault/history");

    return data;
  };

  public getTotalPerformance = async (): Promise<{ performance: number }> => {
    const { data } = await this.client.get("/vaults/performance");
    return data;
  };

  public getTotalInPlay = async (): Promise<{ total: number }> => {
    const { data } = await this.client.get("/inplay");
    return data;
  };

  public getMarketAddresses = async (): Promise<string[]> => {
    const { data } = await this.client.get<string[]>("/markets/");
    return data;
  };

  public getMarketDetail = async (marketAddress: string): Promise<Market> => {
    const { data } = await this.client.get<Market>(`/markets/${marketAddress}`);
    return data;
  };

  public getPrototcolStats = async (): Promise<FormattedProtocol> => {
    const [totalInPlay, totalLiquidity, totalPerformance] = await Promise.all([
      this.getTotalInPlay(),
      this.getTotalLiquidity(),
      this.getTotalPerformance()
    ]);

    return {
      id: "protocol" as const,
      inPlay: totalInPlay.total,
      tvl: totalLiquidity.assets,
      performance: totalPerformance.performance,
      lastUpdate: new Date().getTime()
    };
  };

  public getVaultAddresses = async (): Promise<string[]> => {
    const { data } = await this.client.get<string[]>("/vaults/");
    return data;
  };

  public getVaultDetail = async (vaultAddress: string): Promise<VaultInfo> => {
    const { data } = await this.client.get<VaultInfo>(
      `/vaults/${vaultAddress}`
    );
    return data;
  };

  public getVaultToken = async (vaultAddress: string): Promise<Token> => {
    const { data } = await this.client.get<Token>(
      `/vaults/${vaultAddress}/token`
    );
    return data;
  };

  public getVaultUserData = async (
    vaultAddress: string,
    userAddress: string
  ): Promise<VaultUserData> => {
    const { data } = await this.client.get(
      `/vaults/${vaultAddress}/user/${userAddress}`
    );
    return data;
  };

  public getAllowance = async (
    address: string,
    owner: string,
    spender: string,
    decimals: string
  ): Promise<{
    allowance: string;
  }> => {
    const { data } = await this.client.get("/allowance/", {
      params: {
        address,
        owner,
        spender,
        decimals
      }
    });
    return data;
  };

  public getPotentialPayout = async (
    marketAddress: string,
    propositionId: string,
    wager: number,
    odds: number,
    tokenDecimal: string
  ): Promise<{
    potentialPayout: string;
  }> => {
    const { data } = await this.client.get("/payout/", {
      params: {
        marketAddress,
        propositionId,
        wager,
        odds,
        tokenDecimal
      }
    });
    return data;
  };

  public getBetStats = async () => {
    const { data } = await this.client.get<Partial<Bet>[]>("/bets/stats/");

    return data;
  };

  // // TSOA generating weird routes
  // public getMarketStatsOld = async (): Promise<Bet[]> => {
  //   const { data } = await this.client.get<Bet[]>("/markets/stats/stats/");

  //   return data;
  // };

  public getMarketStats = async (): Promise<MarketStats> => {
    const { data } = await this.client.get<MarketStats>("/markets/stats");

    return data;
  };

  public getMarketHistory = async (): Promise<MarketHistory[]> => {
    const { data } = await this.client.get<MarketHistory[]>(
      "/markets/history/"
    );

    return data;
  };
}
