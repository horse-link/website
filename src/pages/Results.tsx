import moment from "moment";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Loader, PageLayout } from "../components";
import { BetTable } from "../components/Bets";
import { SettleBetModal } from "../components/Modals";
import { ResultsTable } from "../components/Results";
import { useResultsData } from "../hooks/data";
import { BetHistory } from "../types/bets";
import { makeMarketId } from "../utils/markets";
import { formatBytes16String } from "../utils/formatting";
import { useConfig } from "../providers/Config";
import utils from "../utils";
import { useSubgraphBets } from "../hooks/subgraph";
import { useMarketContract } from "../hooks/contracts";

export const Results: React.FC = () => {
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<BetHistory>();

  const config = useConfig();
  const params = useParams();

  const propositionId = params.propositionId || "";
  const details = utils.markets.getDetailsFromPropositionId(propositionId);
  const marketId = makeMarketId(
    new Date(details.date),
    details.track,
    details.race
  );
  const b16MarketId = formatBytes16String(marketId);
  const { betHistory, refetch } = useSubgraphBets(
    false,
    "ALL_BETS",
    b16MarketId
  );

  const results = useResultsData(propositionId);
  const { settleMarket } = useMarketContract();

  const onClickSettleMarket = async () => {
    const tx = await settleMarket(vault, amount, signer);
    // if (!depositAmount || !userBalance || !signer) return;

    // const amount = ethers.utils.parseUnits(depositAmount, userBalance.decimals);
    // setTxHash(undefined);
    // setError(undefined);

    // try {
    //   setTxLoading(true);
    //   const tx = await deposit(vault, amount, signer);
    //   setTxHash(tx);
    // } catch (err: any) {
    //   setError(err);
    // } finally {
    //   setTxLoading(false);
    // }
  };

  return (
    <PageLayout>
      <div className="rounded-lg gap-6">
        <h1 className="font-semibold text-3xl mb-10">
          {details.track} {details.race} Results{" "}
          <span className="block text-lg text-black/50">
            {moment(Date.now()).format("dddd Do MMMM")}
          </span>
        </h1>
        {results ? (
          <ResultsTable results={results} />
        ) : (
          <span className="flex w-full justify-center items-center">
            <Loader />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold mt-4">History</h1>
        <BetTable
          myBetsEnabled={false}
          betHistory={betHistory}
          config={config}
          setSelectedBet={setSelectedBet}
          setIsModalOpen={setIsSettleModalOpen}
        />
        <button
          className="px-4 font-bold border-black border-2 py-1 rounded-md hover:text-white hover:bg-black transition-colors duration-100 mr-4"
          onClick={() => onClickSettleMarket()}
        >
          Settle Market
        </button>
      </div>
      <div className="flex flex-col gap-6"></div>
      <SettleBetModal
        isModalOpen={isSettleModalOpen}
        setIsModalOpen={setIsSettleModalOpen}
        selectedBet={selectedBet}
        refetch={refetch}
        config={config}
      />
    </PageLayout>
  );
};
