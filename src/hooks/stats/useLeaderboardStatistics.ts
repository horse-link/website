import { useEffect, useMemo, useRef, useState } from "react";
import { useConfig } from "../../providers/Config";
import { Bet } from "../../types/subgraph";
import utils from "../../utils";
import useSubgraph from "../useSubgraph";
import { BigNumber, ethers } from "ethers";
import { TWENTY_FOUR_HOURS_S } from "../../constants/time";
import { ERC20__factory } from "../../typechain";
import { useAccount, useProvider } from "wagmi";
import {
  LeaderboardBalance,
  LeaderboardUserBalance
} from "../../types/leaderboard";

type Response = {
  bets: Array<Bet>;
};

export const useLeaderboardStatistics = () => {
  const config = useConfig();
  const provider = useProvider();
  const { address: userAddress, isConnected } = useAccount();

  const [balances, setBalances] = useState<Array<LeaderboardBalance>>();
  const [userBalance, setUserBalance] = useState<LeaderboardUserBalance>();

  const hlToken = config?.tokens.find(t => t.symbol.toLowerCase() === "hl");

  const { current: now } = useRef(Math.floor(Date.now() / 1000));
  const { current: oneWeekAgo } = useRef(now - TWENTY_FOUR_HOURS_S * 7);

  // get bets that were made with horse link token and have been settled, within the last week
  const { data, loading } = useSubgraph<Response>(
    utils.queries.getBetsQueryWithoutPagination({
      assetAddress: hlToken?.address.toLowerCase(),
      settled: true,
      createdAt_gte: oneWeekAgo
    })
  );

  // sort the subgraph data
  const sortedData = useMemo(() => {
    if (loading || !data?.bets.length || !hlToken || !config) return;
    const { bets } = data;

    // create object that looks like
    // {
    //  [address: string]: BigNumber
    // }
    // key: user address, value: sum of payouts as a BN
    const reduced = bets.reduce((prevObject, bet) => {
      const prevValue = prevObject[bet.owner] || ethers.constants.Zero;

      return {
        ...prevObject,
        [bet.owner]: ethers.utils
          .parseEther(ethers.utils.formatEther(bet.payout))
          .mul(bet.didWin ? "1" : "-1")
          .add(prevValue)
      };
    }, {} as Record<string, BigNumber>);

    // turn object into an array for easy sorting
    const asArray = Object.entries(reduced).reduce(
      (prevArray, [address, value]) => [...prevArray, { address, value }],
      [] as Array<{ address: string; value: BigNumber }>
    );

    // sort the new array in place, comparison is in essence (a, b) => b - a
    asArray.sort((a, b) => +ethers.utils.formatEther(b.value.sub(a.value)));

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
          formatted: ethers.utils.formatUnits(balance, decimals)
        };
      })
    )
      .then(setBalances)
      .catch(console.error);
  }, [sortedData, provider, hlToken]);

  // get individual user data
  useEffect(() => {
    if (!userAddress || !isConnected || !hlToken || !sortedData) return;

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
          rank,
          address: userAddress,
          earnings: {
            value: userData.value,
            decimals,
            formatted: ethers.utils.formatUnits(userData.value, decimals)
          },
          balance: {
            value: balance,
            decimals,
            formatted: ethers.utils.formatUnits(balance, decimals)
          }
        })
      )
      .catch(console.error);
  }, [userAddress, isConnected, hlToken, provider, sortedData]);

  // return top 10 from stats array
  return {
    stats: sortedData?.slice(0, 10),
    balances,
    userStats: userBalance
  };
};