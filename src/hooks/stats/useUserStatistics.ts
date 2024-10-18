import { useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import { Bet, BetResult, Deposit } from "../../types/subgraph";
import useSubgraph from "../useSubgraph";
import utils from "../../utils";

type BetResponse = {
  bets: Array<Bet>;
};

type DepositsResponse = {
  deposits: Array<Deposit>;
};

export const useUserStatistics = () => {
  const { address } = useAccount();
  const { current: now } = useRef(Math.floor(Date.now() / 1000));

  const { data: betsData, loading: betsLoading } = useSubgraph<BetResponse>(
    utils.queries.getBetsQueryWithoutPagination(now)
  );
  const { data: depositData, loading: depositLoading } =
    useSubgraph<DepositsResponse>(
      utils.queries.getDepositsWithoutPagination({
        userAddress: address
      })
    );

  const bets = useMemo(() => {
    if (betsLoading || !betsData) return;

    return betsData.bets;
  }, [betsData, betsLoading]);

  const deposits = useMemo(() => {
    if (depositLoading || !depositData) return;

    return depositData.deposits;
  }, [depositData, depositLoading]);

  // get total deposited into the vault
  const totalDeposited = useMemo(() => {
    if (!deposits) return;

    return deposits.reduce((sum, cur) => sum.add(cur.assets), 0n);
  }, [deposits]);

  // get total inplay
  const inPlay = useMemo(() => {
    if (!bets) return;

    return bets
      .filter(b => !b.settled)
      .reduce((sum, cur) => sum.add(cur.amount), 0n);
  }, [bets]);

  // get pnl
  const pnl = useMemo(() => {
    if (!bets) return;

    return bets
      .filter(b => b.settled)
      .reduce((sum, cur) => {
        const isWin = cur.result === BetResult.WINNER;
        let delta = cur.payout;

        if (!isWin) delta = delta.mul(-1);

        return sum.add(delta);
      }, 0n);
  }, [bets]);

  return {
    totalDeposited,
    inPlay,
    pnl,
    lastUpdate: now
  };
};
