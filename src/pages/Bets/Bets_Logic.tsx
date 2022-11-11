import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { BetHistory } from "../../types";
import BetsView from "./Bets_View";
import api from "../../apis/Api";

const getMockBets = () => {
  return Array.from({ length: 5 }, () => undefined);
};

const formatAmount = (amountStr: string) => {
  const amount = parseFloat(amountStr);
  if (amount < 0.0001) return "0.0001<";

  const roundedToFourDecimal = amount.toFixed(4);
  const removedTrailingZeros = (+roundedToFourDecimal).toString();
  return removedTrailingZeros;
};

const useBets = () => {
  const { address } = useAccount();

  const [bets, setBets] = useState<BetHistory[]>();
  const [myBets, setMyBets] = useState<BetHistory[]>();

  useEffect(() => {
    const load = async () => {
      const { results } = await api.getBetHistory();
      setBets(results);
    };
    load();
  }, []);

  useEffect(() => {
    if (!address) return;
    const load = async () => {
      const { results } = await api.getUserBetHistory(address);
      setMyBets(results);
    };
    load();
  }, [address]);

  return { bets, myBets };
};

const BetsLogics = () => {
  const { bets, myBets } = useBets();
  const [myBetsEnabled, setMyBetsEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<BetHistory>();

  const onClickBet = (betData?: BetHistory) => {
    if (!betData) return;
    setSelectedBet(betData);
    setIsModalOpen(true);
  };

  const onMyBetToggle = (isEnable: boolean) => {
    setMyBetsEnabled(isEnable);
  };

  const betsData = myBetsEnabled ? myBets : bets;
  const formattedBetsData = betsData?.map(bet => {
    return {
      ...bet,
      amount: formatAmount(bet.amount)
    };
  });

  return (
    <BetsView
      betsData={formattedBetsData || getMockBets()}
      myBetsEnabled={myBetsEnabled}
      onMyBetToggle={onMyBetToggle}
      onClickBet={onClickBet}
      isModalOpen={isModalOpen}
      onCloseModal={() => setIsModalOpen(false)}
      selectedBet={selectedBet}
    />
  );
};

export default BetsLogics;
