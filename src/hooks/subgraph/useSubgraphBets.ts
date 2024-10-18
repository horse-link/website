import { useEffect, useMemo, useRef, useState } from "react";
import { useBetSlipContext } from "../../providers/BetSlip";
import {
  BetFilterOptions,
  BetHistory,
  TotalBetsOnPropositions
} from "../../types/bets";
import { Bet } from "../../types/subgraph";
import useRefetch from "../useRefetch";
import useSubgraph from "../useSubgraph";
import utils from "../../utils";
import constants from "../../constants";
import { gql } from "@apollo/client";
import { ethers } from "ethers";
import { useApi } from "../../providers/Api";
import { useApolloContext } from "../../providers/Apollo";

type BetResponse = {
  bets: Bet[];
};

export const useSubgraphBets = (
  filter: BetFilterOptions,
  marketId?: string,
  owner?: string
) => {
  const ApolloClient = useApolloContext();

  const { shouldRefetch, refetch } = useRefetch();
  const { current: now } = useRef(Math.floor(Date.now() / 1000));

  const api = useApi();

  // refetch when successful transactions are made
  const { hashes } = useBetSlipContext();
  useEffect(() => {
    if (!hashes?.length) return;
    refetch();
  }, [hashes]);

  const [bets, setBets] = useState<Array<BetHistory>>();
  const [skipMultiplier, setSkipMultiplier] = useState(0);
  const userBetsToggled = !!owner;

  // subgraph query
  const { data: rawBets } = useSubgraph<BetResponse>(
    utils.queries.getBetsQueryWithoutPagination(
      now,
      {
        owner: owner?.toLowerCase()
      },
      filter
    )
  );

  // total
  const totalBets = rawBets?.bets.length;

  // increment skip
  const incrementPage = () => {
    if (!totalBets) return;

    const nextMulti = skipMultiplier + 1;

    if (
      totalBets % (nextMulti * constants.subgraph.MAX_BET_ENTITIES) ===
      totalBets
    )
      return;

    setSkipMultiplier(nextMulti);
  };

  // decrement skip
  const decrementPage = () => {
    if (!totalBets) return;

    const previousMulti = skipMultiplier - 1;
    if (skipMultiplier === 0) return;

    setSkipMultiplier(previousMulti);
  };

  // reset page when user's bets toggled
  useEffect(() => {
    setSkipMultiplier(0);
    setBets(undefined);
  }, [userBetsToggled]);

  // get bets
  useEffect(() => {
    // https://www.developerway.com/posts/fetching-in-react-lost-promises
    let isActive = true;

    if (!rawBets) return;
    setBets(undefined);

    const query = utils.queries.getBetsQuery(
      now,
      {
        owner: owner?.toLowerCase(),
        marketId
      },
      filter,
      skipMultiplier
    );

    // query subgraph
    ApolloClient.query<BetResponse>({
      query: gql(query),
      fetchPolicy: "network-only"
    }).then(async ({ data: { bets } }) => {
      const marketIds = bets.map(bet => bet.marketId);
      const uniqueMarketIds = [...new Set(marketIds)];
      const signedDataMap = new Map();
      await Promise.all(
        uniqueMarketIds
          .filter(m => !!m)
          .map(async marketId => {
            if (marketId === undefined) {
              return;
            }
            try {
              const signedData = await api.getWinningResultSignature(marketId);
              signedDataMap.set(marketId, signedData);
            } catch (e) {
              console.warn("Error getting result signature:", e);
            }
          })
      );
      try {
        const signedBets = (
          await Promise.all(
            bets
              .filter(bet => !!bet)
              .map(async bet => {
                const signedData = signedDataMap.get(bet.marketId);
                try {
                  const result = utils.bets.getBetHistory(bet, signedData);
                  return result;
                } catch (e) {
                  console.warn(
                    `Error getting bet history for ${JSON.stringify(
                      bet,
                      null,
                      2
                    )}:`,
                    e
                  );
                  return undefined;
                }
              })
          )
        ).filter(bet => !!bet) as BetHistory[];

        if (isActive) setBets(signedBets);
      } catch (e) {
        console.warn("Error getting bet history:", e);
      }
    });

    // cleanup
    return () => {
      isActive = false;
    };
  }, [rawBets, skipMultiplier, filter, marketId, owner, shouldRefetch, now]);

  // total proposition bets
  const totalBetsOnPropositions = useMemo(() => {
    if (!bets) return;

    const totalBets = bets.reduce((prevObject, bet, _, array) => {
      const amount = ethers.utils
        .parseEther(prevObject[bet.propositionId]?.amount || "0")
        .add(ethers.parseEther(bet.amount));

      const totalBetValue = array.reduce(
        (sum, cur) => sum.add(ethers.parseEther(cur.amount)),
        ethers.constants.Zero
      );

      const proportion = amount
        .mul(ethers.constants.WeiPerEther)
        .div(totalBetValue);

      return {
        ...prevObject,
        [bet.propositionId]: {
          amount: ethers.formatEther(amount),
          percentage: +ethers.formatEther(proportion) * 100
        }
      };
    }, {} as TotalBetsOnPropositions);

    return totalBets;
  }, [bets]);

  return {
    betData: bets,
    totalBetsOnPropositions,
    currentPage: skipMultiplier + 1,
    refetch,
    incrementPage,
    decrementPage,
    setSkipMultiplier
  };
};
