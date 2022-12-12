import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useSubgraphBets } from "../hooks/subgraph";
import { Toggle, PageLayout } from "../components";
import { BetFilterGroup, BetTable } from "../components/Bets";
import { SettleBetModal } from "../components/Modals";
import { BetFilterOptions, BetHistory } from "../types/bets";
import { useWalletModal } from "../providers/WalletModal";
import { useConfig } from "../providers/Config";

export const Bets: React.FC = () => {
  const [myBetsEnabled, setMyBetsEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<BetHistory>();
  const [betTableFilter, setBetTableFilter] =
    useState<BetFilterOptions>("ALL_BETS");

  const { isConnected } = useAccount();
  const { openWalletModal } = useWalletModal();

  const config = useConfig();

  const { betHistory, refetch } = useSubgraphBets(
    myBetsEnabled,
    betTableFilter
  );

  const onClickBet = (betData?: BetHistory) => {
    if (!betData) return;
    if (!isConnected) return openWalletModal();
    setSelectedBet(betData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    setMyBetsEnabled(isConnected);
  }, [isConnected]);

  const onMyBetToggle = () => setMyBetsEnabled(prev => !prev);
  const onFilterChange = (option: BetFilterOptions) =>
    setBetTableFilter(option);

  const isLoading = !betHistory;
  return (
    <PageLayout>
      <div className="w-full lg:justify-between lg:flex col-span-2 p-3">
        <h3 className="text-lg font-medium text-gray-900 flex items-center flex-row flex-nowrap my-3">
          Bets History
        </h3>
        <div className="flex my-3 justify-items-end">
          <BetFilterGroup
            value={betTableFilter}
            onChange={onFilterChange}
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-3 items-center">
          <Toggle enabled={myBetsEnabled} onChange={onMyBetToggle} />
          <div className="font-semibold">My Bets</div>
        </div>
      </div>
      <BetTable
        myBetsEnabled={myBetsEnabled}
        onClickBet={onClickBet}
        betHistory={betHistory}
        config={config}
      />
      <SettleBetModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedBet={selectedBet}
        refetch={refetch}
        config={config}
      />
    </PageLayout>
  );
};
