import { BigNumber, ethers } from "ethers";
import { useMemo } from "react";
import utils from "../../utils";
import { useApi } from "../../providers/Api";
import { usePromise } from "../usePromise";

export const useBetsStatistics = () => {
  const api = useApi();
  const betsData = usePromise(api.getBetStats);

  //Total winning bets for the bets page
  const totalWinningBets = useMemo(() => {
    if (!betsData) return;

    return betsData.length;
  }, [betsData]);

  //Winning volume bets on the bets page
  const totalWinningVolume = useMemo(() => {
    if (!betsData) return;
    if (!totalWinningBets) return 0n;

    const amountBigNumbers = betsData.map(bet => BigNumber.from(bet.payout));

    return amountBigNumbers.reduce((sum, value) => sum.add(value), 0n);
  }, [betsData, totalWinningBets]);

  //Largest winning bet on the bets page
  const largestWinningBet = useMemo(() => {
    if (!betsData) return;
    if (!totalWinningBets) return utils.mocks.getMockBet();

    return betsData.reduce((prev, curr) =>
      BigNumber.from(curr.payout).gt(BigNumber.from(prev.payout)) ? curr : prev
    );
  }, [betsData, totalWinningBets]);

  return {
    totalWinningBets,
    totalWinningVolume,
    largestWinningBet
  };
};
