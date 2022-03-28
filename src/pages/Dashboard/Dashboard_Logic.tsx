import DashboardView from "./Dashboard_View";
import moment from "moment";
import useApi from "../../hooks/useApi";
import { useEffect, useState } from "react";
// import useSWR from "swr";

type Props = {};

export type Meet = {
  id: string;
  name: string;
  location: string;
};

const Dashboard: React.FC<Props> = () => {
  const meets: Meet[] = [
  ];

  const api = useApi();
  const [data, setData] = useState<Meet[]>(meets);
  
  const load = async () => {
    const results: Meet[] = await api.getMeetings();
    console.log(results);
    setData(results);
  };

  useEffect(() => {
      load();
  }, []);

  const asLocaltime = (raceTime: number) => {
    const _time = moment.utc(raceTime).diff(moment(), "h");
    if (Date.now() / 1000 > moment.utc(raceTime).unix()) {
      return "Completed";
    }

    return `${_time.toString()} hr`;
  }

  return <DashboardView asLocaltime={asLocaltime} meets={data} />;
};

export default Dashboard;
