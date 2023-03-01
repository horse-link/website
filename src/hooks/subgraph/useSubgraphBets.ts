import {
  BetFilterOptions,
  BetHistory,
  TotalBetsOnPropositions
} from "../../types/bets";
import { Aggregator, Bet } from "../../types/subgraph";
import utils from "../../utils";
import useSubgraph from "../useSubgraph";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApolloClient } from "../../providers/Apollo";
import { gql } from "@apollo/client";
import api from "../../apis/Api";
import { ethers } from "ethers";
import constants from "../../constants";
import useRefetch from "../useRefetch";
import { useBetSlipContext } from "../../providers/BetSlip";

type BetResponse = {
  bets: Bet[];
};
type AggregatorResponse = {
  aggregator: Aggregator;
};

export const useSubgraphBets = (
  betFilterOptions: BetFilterOptions,
  marketId?: string,
  // owner will exist if my bets are enabled
  owner?: string
) => {
  const { shouldRefetch, refetch } = useRefetch();
  const { hashes } = useBetSlipContext();

  useEffect(() => {
    if (!hashes?.length) return;
    refetch();
  }, [hashes]);

  const [skipMultiplier, setSkipMultiplier] = useState(0);
  const [betData, setBetData] = useState<BetHistory[]>();

  // make constant for if my bets is selected
  const myBetsSelected = !!owner;

  // get total bets across all users
  const { data: aggregatorData } = useSubgraph<AggregatorResponse>(
    utils.queries.getAggregatorQuery()
  );

  // total bets for given user
  const { data: userAggregateData } = useSubgraph<BetResponse>(
    utils.queries.getBetsQueryWithoutPagination({
      owner: owner?.toLowerCase()
    })
  );

  // total bets for given filter option
  const { data: filteredAggregateData } = useSubgraph<BetResponse>(
    utils.queries.getBetsQueryWithoutPagination(undefined, betFilterOptions)
  );

  // calculate total bets
  const totalBets = useMemo(() => {
    if (!aggregatorData || !userAggregateData || !filteredAggregateData) return;

    const userTotal = userAggregateData.bets.length;
    const aggregateTotal = +aggregatorData.aggregator.totalBets;
    const filteredTotal = filteredAggregateData.bets.length;

    if (myBetsSelected) {
      if (betFilterOptions === "ALL_BETS") {
        return userTotal;
      } else {
        const userFilteredTotal = filteredAggregateData.bets.filter(
          b => b.owner.toLowerCase() === owner.toLowerCase()
        ).length;
        return userFilteredTotal;
      }
    }

    if (betFilterOptions === "ALL_BETS") {
      return aggregateTotal;
    } else {
      return filteredTotal;
    }
  }, [
    aggregatorData,
    userAggregateData,
    myBetsSelected,
    filteredAggregateData,
    owner
  ]);

  const incrementPage = useCallback(() => {
    if (!totalBets) return;

    const nextMulti = skipMultiplier + 1;

    if (
      totalBets % (nextMulti * constants.subgraph.MAX_BET_ENTITIES) ===
      totalBets
    )
      return;

    setSkipMultiplier(nextMulti);
  }, [totalBets, skipMultiplier, setSkipMultiplier]);

  const decrementPage = useCallback(() => {
    if (!totalBets) return;

    const previousMulti = skipMultiplier - 1;
    if (skipMultiplier === 0) return;

    setSkipMultiplier(previousMulti);
  }, [totalBets, skipMultiplier, setSkipMultiplier]);

  // reset page when my bets get toggled
  useEffect(() => {
    setSkipMultiplier(0);
    setBetData(undefined);
  }, [myBetsSelected]);

  // get bet data
  useEffect(() => {
    // https://www.developerway.com/posts/fetching-in-react-lost-promises
    let isActive = true;

    if (!aggregatorData) return;
    setBetData(undefined);

    const query = gql`
      ${utils.queries.getBetsQuery(
        {
          owner: owner?.toLowerCase(),
          marketId
        },
        betFilterOptions,
        skipMultiplier
      )}
    `;

    ApolloClient.query<BetResponse>({
      query,
      fetchPolicy: "network-only"
    }).then(({ data: { bets } }) => {
      Promise.all(
        bets.map(async bet => {
          const signedData = await api.getWinningResultSignature(
            utils.formatting.parseBytes16String(bet.marketId)
          );

          return utils.bets.getBetHistory(bet, signedData);
        })
      ).then(betsWithApiData => {
        const filteredBets = utils.bets.filterBetsByFilterOptions(
          betsWithApiData,
          betFilterOptions
        );

        if (isActive) setBetData(filteredBets);
      });
    });

    return () => {
      isActive = false;
    };
  }, [
    owner,
    betFilterOptions,
    marketId,
    aggregatorData,
    skipMultiplier,
    shouldRefetch
  ]);

  const totalBetsOnPropositions = useMemo(() => {
    if (!betData) return;

    const totalBets = betData.reduce((prevObject, bet, _, array) => {
      const proposition = utils.formatting.parseBytes16String(
        bet.propositionId
      );

      const amount = ethers.utils
        .parseEther(prevObject[proposition]?.amount || "0")
        .add(ethers.utils.parseEther(bet.amount));

      const totalBetValue = array.reduce(
        (sum, cur) => sum.add(ethers.utils.parseEther(cur.amount)),
        ethers.constants.Zero
      );

      const proportion = amount
        .mul(ethers.constants.WeiPerEther)
        .div(totalBetValue);

      return {
        ...prevObject,
        [proposition]: {
          amount: ethers.utils.formatEther(amount),
          percentage: +ethers.utils.formatEther(proportion) * 100
        }
      };
    }, {} as TotalBetsOnPropositions);

    return totalBets;
  }, [betData]);

  return {
    betData,
    totalBetsOnPropositions,
    currentPage: skipMultiplier + 1,
    refetch,
    incrementPage,
    decrementPage,
    setSkipMultiplier
  };
};
