import { PageLayout } from "../../components";
import { Link } from "react-router-dom";
import moment from "moment";
import { Runner } from "../../types";

type Props = {
  track: string;
  raceNumber: number;
  runners: Runner[];
};

const HorseRaceView: React.FC<Props> = (props: Props) => {
  const { track, raceNumber, runners } = props;

  return (
    <PageLayout requiresAuth={false}>
      <div className="flex mb-6 p-2 shadow overflow-hidden border-b bg-white border-gray-200 sm:rounded-lg justify-around">
        <h1>Track: {track}</h1>
        <h1>Race #: {raceNumber}</h1>
        <h1>Date: {moment().format("DD-MM-YY")}</h1>
      </div>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-1 py-3 text-left text-xs font-medium text-gray-500 bg-gray-200 uppercase"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Runner (Barrier)
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Weight
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Win
                    </th>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      Place
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {runners.map(runner => {
                    const {
                      proposition_id,
                      proposition_id_hash,
                      market_id,
                      odds,
                      close,
                      end,
                      nonce,
                      signature
                    } = runner;
                    const backPath = `/back/${proposition_id}?market_id=${market_id}&odds=${odds}&close=${close}&end=${end}&nonce=${nonce}&signature=${signature.signature}&proposition_id_hash=${proposition_id_hash}`;
                    return (
                      <tr key={runner.number}>
                        <td className="px-1 py-4 whitespace-nowrap bg-gray-200">
                          {runner.number}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">
                          {runner.name} ({runner.barrier})
                          <br />
                          {/* {horse.Rider} */}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">NA</td>
                        <Link to={backPath}>
                          <td className="px-2 py-4 whitespace-nowrap">
                            {runner.odds / 1000}
                          </td>
                        </Link>
                        <td className="px-2 py-4 whitespace-nowrap">NA</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default HorseRaceView;
