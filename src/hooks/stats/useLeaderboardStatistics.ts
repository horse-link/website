import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig } from "../../providers/Config";
import { Bet, BetResult } from "../../types/subgraph";
import utils from "../../utils";
import useSubgraph from "../useSubgraph";
import { ethers } from "ethers";
import { ERC20__factory } from "../../typechain";
import { useAccount, useProvider } from "wagmi";
import {
  LeaderboardBalance,
  LeaderboardUserBalance
} from "../../types/leaderboard";
import constants from "../../constants";

type Response = {
  bets: Array<Bet>;
};

export const useLeaderboardStatistics = () => {
  const config = useConfig();
  const provider = useProvider();
  const { address: userAddress, isConnected } = useAccount();

  const [balances, setBalances] = useState<Array<LeaderboardBalance>>();
  const [userBalance, setUserBalance] = useState<LeaderboardUserBalance>();

  const hlToken = config?.tokens.find(t =>
    t.symbol.toLowerCase().includes("hl")
  );

  const { current: now } = useRef(Math.floor(Date.now() / 1000));

  // get bets that were made with horse link token and have been settled, within the last week
  const { data, loading } = useSubgraph<Response>(
    utils.queries.getBetsQueryWithoutPagination(now, {
      asset: hlToken?.address.toLowerCase(),
      settled: true,
      createdAt_gte: Math.floor(+constants.env.EVENT_TS / 1000)
    })
  );

  // sort the subgraph data
  const sortedData = useMemo(() => {
    if (loading || !hlToken || !config) return;
    if (!data?.bets.length) return [];

    const { bets } = data;

    // create object that looks like
    // {
    //  [address: string]: BigNumber
    // }
    // key: user address, value: sum of payouts as a BN
    const reduced = bets.reduce((prevObject, bet) => {
      const prevValue = prevObject[bet.owner] || 0n;

      const winChange = ethers.parseEther(ethers.formatEther(bet.payout));
      const lossChange = ethers.utils
        .parseEther(ethers.formatEther(bet.amount))
        .mul("-1");

      return {
        ...prevObject,
        [bet.owner]: (bet.result === BetResult.WINNER
          ? winChange
          : lossChange
        ).add(prevValue)
      };
    }, {} as Record<string, BigNumber>);

    // turn object into an array for easy sorting
    const asArray = Object.entries(reduced).reduce(
      (prevArray, [address, value]) => [...prevArray, { address, value }],
      [] as Array<{ address: string; value: BigNumber }>
    );

    // sort the new array in place, comparison is in essence (a, b) => b - a
    asArray.sort((a, b) => +ethers.formatEther(b.value.sub(a.value)));

    return asArray;
  }, [data, loading, hlToken, config]);

  // get balances for users
  useEffect(() => {
    if (!sortedData?.length || !hlToken) return;
    const addresses = Object.values(sortedData).map(data => data.address);

    Promise.all(
      addresses.map(async address => {
        const tokenContract = ERC20__factory.connect(hlToken.address, provider);
        const [balance, decimals] = await Promise.all([
          tokenContract.balanceOf(address),
          tokenContract.decimals()
        ]);

        return {
          address,
          value: balance,
          decimals,
          formatted: ethers.formatUnits(balance, decimals)
        };
      })
    )
      .then(setBalances)
      .catch(console.error);
  }, [sortedData, provider, hlToken]);

  // get individual user data
  useEffect(() => {
    if (!userAddress || !isConnected || !hlToken || !sortedData)
      return setUserBalance(undefined);

    // get user rank
    const userData = sortedData.find(
      data => data.address.toLowerCase() === userAddress.toLowerCase()
    );
    // do nothing if the user isn't in the data
    if (!userData) return;
    const rank = sortedData.indexOf(userData);
    // return if the rank cannot be determined
    if (rank === -1) return;

    const hlContract = ERC20__factory.connect(hlToken.address, provider);
    Promise.all([hlContract.balanceOf(userAddress), hlContract.decimals()])
      .then(([balance, decimals]) =>
        setUserBalance({
          rank: rank + 1,
          address: userAddress,
          earnings: {
            value: userData.value,
            decimals,
            formatted: ethers.formatUnits(userData.value, decimals)
          },
          balance: {
            value: balance,
            decimals,
            formatted: ethers.formatUnits(balance, decimals)
          }
        })
      )
      .catch(console.error);
  }, [userAddress, isConnected, hlToken, provider, sortedData]);

  // loading state
  const statsLoading = useMemo(() => {
    if (loading) return true;

    if (!sortedData || !balances) return false;

    return false;
  }, [loading]);

  // return top 10 from stats array
  return {
    stats: sortedData?.slice(0, 10),
    balances,
    userStats: userBalance,
    loading: statsLoading
  };
};
