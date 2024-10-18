import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader, PageLayout } from "../components";
import { BetTable, ResultsTable } from "../components/Tables";
import { SettleBetModal, SettledMarketModal } from "../components/Modals";
import { useBetsData, useMeetData, useResultsData } from "../hooks/data";
import { useConfig } from "../providers/Config";
import utils from "../utils";
import { RacesButton, SettleRaceButton } from "../components/Buttons";
import dayjs from "dayjs";
import { useAccount, useWalletClient } from "wagmi";
import { BetHistoryResponse2 } from "../types/bets";
import { RaceInfo, markets } from "horselink-sdk";
import { BrowserProvider, JsonRpcSigner } from "ethers";

const Results: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settleHashes, setSettleHashes] = useState<Array<string>>();
  const [isSettledMarketModalOpen, setIsSettledMarketModalOpen] =
    useState(false);
  const [thisRace, setThisRace] = useState<RaceInfo>();
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<BetHistoryResponse2>();

  const config = useConfig();
  const params = useParams();
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

  useEffect(() => {
    const setupSigner = async () => {
      if (walletClient) {
        const provider = new BrowserProvider(walletClient.transport);
        const newSigner = await provider.getSigner();
        setSigner(newSigner);
      }
    };
    setupSigner();
  }, [walletClient]);

  const propositionId = params.propositionId || "";
  const details = utils.markets.getDetailsFromPropositionId(propositionId);

  const { current: date } = useRef(dayjs().format("DD-MM-YY"));

  const meetRaces = useMeetData(details.track || "");

  useEffect(() => {
    if (!meetRaces) return;

    const raceResultsData = meetRaces.raceInfo.find(
      meetInfo => meetInfo.raceNumber.toString() === details.race
    );
    setThisRace(raceResultsData);
  }, [meetRaces, details]);

  const raceParams = {
    track: details.track,
    number: details.race
  };

  const results = useResultsData(propositionId);

  const closeSettledMarketModal = () => setIsSettledMarketModalOpen(false);

  const marketId = markets.makeMarketId(
    new Date(),
    details.track,
    raceParams.number,
    "W"
  );
  const betHistory = useBetsData({
    marketId
  });

  return (
    <PageLayout>
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <RacesButton params={raceParams} meetRaces={meetRaces?.raceInfo} />
        </div>
        <div className="flex flex-col justify-between border border-hl-border bg-hl-background-secondary px-4 py-3 font-basement text-sm tracking-wider text-hl-primary xl:flex-row">
          {!thisRace ? (
            <div className="flex w-full justify-center py-2">
              <Loader />
            </div>
          ) : (
            <React.Fragment>
              <h1 className="text-center">{thisRace.raceName}</h1>
              <h2 className="text-center">
                Track:{" "}
                {results
                  ? `${results.track.name} - (${results.track.code})`
                  : details.track}
              </h2>
              <h2 className="text-center">Race #: {thisRace.raceNumber}</h2>
              <h2 className="text-center">Date: {date}</h2>
              <h2 className="text-center">
                Distance: {thisRace.raceDistance}m
              </h2>
              <h2 className="text-center">
                Class: {thisRace.raceClassConditions}
              </h2>
            </React.Fragment>
          )}
        </div>
        <ResultsTable results={results} />
      </div>
      <div className="mt-10">
        <h2>HISTORY</h2>
      </div>
      <div className="mt-4">
        <BetTable
          paramsAddressExists={true}
          allBetsEnabled={true}
          betHistory={betHistory}
          config={config}
          setSelectedBet={setSelectedBet}
          setIsModalOpen={setIsSettleModalOpen}
        />
      </div>
      <div className="mt-4 flex w-full justify-end">
        <SettleRaceButton
          betHistory={betHistory}
          loading={loading}
          isConnected={isConnected}
          config={config}
          signer={signer}
          setIsSettledMarketModalOpen={setIsSettledMarketModalOpen}
          setLoading={setLoading}
          setSettleHashes={setSettleHashes}
        />
      </div>
      <div className="block py-10 lg:hidden" />
      <SettleBetModal
        isModalOpen={isSettleModalOpen}
        setIsModalOpen={setIsSettleModalOpen}
        selectedBet={selectedBet}
        config={config}
      />
      <SettledMarketModal
        isOpen={isSettledMarketModalOpen}
        onClose={closeSettledMarketModal}
        hashes={settleHashes}
      />
    </PageLayout>
  );
};

export default Results;
