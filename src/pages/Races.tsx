import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useRunnersData, useMeetData } from "../hooks/data";
import { NewButton, RacesButton } from "../components/Buttons";
import { NewBetTable, NewRaceTable } from "../components/Tables";
import { PlaceBetModal, SettleBetModal } from "../components/Modals";
import { Runner } from "../types/meets";
import { PageLayout } from "../components";
import { useSubgraphBets } from "../hooks/subgraph";
import { BetHistory } from "../types/bets";
import { makeMarketId } from "../utils/markets";
import { formatBytes16String } from "../utils/formatting";
import { useConfig } from "../providers/Config";
import constants from "../constants";

import Skeleton from "react-loading-skeleton";
import dayjs from "dayjs";
import utils from "../utils";

const Races: React.FC = () => {
  const params = useParams();
  const track = params.track || "";
  const raceNumber = Number(params.number) || 0;
  const meetRaces = useMeetData(params.track || "");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedRunner, setSelectedRunner] = useState<Runner>();
  const [selectedBet, setSelectedBet] = useState<BetHistory>();
  const [closed, setClosed] = useState(false);
  const { race } = useRunnersData(track, raceNumber);
  const config = useConfig();

  const { meetDate } = useMemo(() => {
    const meetDate = dayjs().format("DD-MM-YY");
    return { config, meetDate };
  }, []);

  const marketId = makeMarketId(new Date(), track, raceNumber.toString());
  const b16MarketId = formatBytes16String(marketId);
  const {
    betData: betHistory,
    totalBetsOnPropositions,
    refetch
  } = useSubgraphBets("ALL_BETS", b16MarketId);

  const margin = useMemo(() => {
    if (!race || !race.runners.length) return;

    const validRunners = race.runners.filter(
      runner => !utils.races.isScratchedRunner(runner)
    );

    return utils.races.calculateRaceMargin(validRunners.map(r => r.odds));
  }, [race]);

  useEffect(() => {
    const interval = setInterval(() => {
      setClosed(dayjs().unix() > (race?.raceData.close || 0));
    }, constants.time.ONE_SECOND_MS);

    return () => clearInterval(interval);
  });

  return (
    <PageLayout>
      <PlaceBetModal
        runner={selectedRunner}
        race={race}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      <div className="flex flex-col gap-6">
        <div className="flex gap-2">
          <RacesButton params={params} meetRaces={meetRaces?.raceInfo} />
        </div>
        <div className="flex justify-between border border-hl-border bg-hl-background-secondary px-4 py-3 font-basement text-sm tracking-wider text-hl-primary">
          <h1>{race ? race.raceData.name : <Skeleton width={200} />}</h1>
          <h2>
            {race ? (
              `${race.track.name} - (${race.track.code})`
            ) : (
              <Skeleton width={150} />
            )}
          </h2>
          <h2>{meetDate}</h2>
          <h2>
            {race ? `${race.raceData.distance}m` : <Skeleton width={50} />}
          </h2>
          <h2>Race #: {raceNumber}</h2>
          <h2>Class: {race ? race.raceData.class : <Skeleton width={30} />}</h2>
          <h2>
            Margin:{" "}
            {margin ? (
              `${utils.formatting.formatToTwoDecimals(
                (+margin * 100).toString()
              )}%`
            ) : (
              <Skeleton width={50} />
            )}
          </h2>
          <h2>
            {!meetRaces ? (
              <Skeleton />
            ) : !utils.formatting.formatTrackCondition(meetRaces) ? null : (
              `${utils.formatting.formatTrackCondition(meetRaces)}, ${
                meetRaces.weatherCondition
              }`
            )}
          </h2>
        </div>
        <NewRaceTable
          runners={race?.runners}
          setSelectedRunner={setSelectedRunner}
          setIsModalOpen={setIsModalOpen}
          totalBetsOnPropositions={totalBetsOnPropositions}
          closed={closed}
        />
      </div>
      <div className="mt-10">
        <NewButton text="history" onClick={() => {}} disabled active={false} />
      </div>
      <div className="mt-4">
        <NewBetTable
          paramsAddressExists={true}
          allBetsEnabled={false}
          betHistory={betHistory}
          config={config}
          setSelectedBet={setSelectedBet}
          setIsModalOpen={setIsSettleModalOpen}
        />
      </div>
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

export default Races;
