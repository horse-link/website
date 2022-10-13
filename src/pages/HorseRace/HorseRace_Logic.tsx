import { useEffect, useState } from "react";
import { Runner, SignedRunnersResponse } from "../../types";
import HorseRaceView from "./HorseRace_View";
import useApi from "../../hooks/useApi";
import { useParams } from "react-router-dom";

const HorseRace: React.FC = () => {
  const params = useParams();
  const track = params.track || "";
  const raceNumber = Number(params.number) || 0;

  const api = useApi();
  const [runners, setRunners] = useState<Runner[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRunner, setSelectedRunner] = useState<Runner>();

  useEffect(() => {
    if (!track || !raceNumber) return;
    const load = async () => {
      const { data } = await api.getRunners(track, raceNumber);
      setRunners(data);
    };
    load();
  }, [api, track, raceNumber]);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const onClickRunner = (runner: Runner) => {
    setSelectedRunner(runner);
    openDialog();
  };

  return (
    <HorseRaceView
      track={track}
      raceNumber={raceNumber}
      runners={runners}
      onClickRunner={onClickRunner}
      isDialogOpen={isDialogOpen}
      onCloseDialog={() => setIsDialogOpen(false)}
      selectedRunner={selectedRunner}
    />
  );
};

export default HorseRace;
