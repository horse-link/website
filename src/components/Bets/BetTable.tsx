import { BetRows } from ".";
import React from "react";
import { BetHistory } from "../../types/bets";
import { useAccount } from "wagmi";
import { Config } from "../../types/config";

type Props = {
  myBetsEnabled: boolean;
  onClickBet: (bet?: BetHistory) => void;
  betHistory: BetHistory[] | undefined;
  config?: Config;
};

export const BetTable: React.FC<Props> = ({
  myBetsEnabled,
  onClickBet,
  betHistory,
  config
}) => {
  const { isConnected } = useAccount();

  return (
    <React.Fragment>
      <div className="col-span-2 bg-gray-50 rounded-xl overflow-auto">
        <div className="shadow-sm overflow-x-scroll mt-2 mb-5">
          <table className="border-collapse table-fixed w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-center">
                <th
                  scope="col"
                  className="px-2 py-3 w-32 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Index
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 w-32 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Punter
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 w-40 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 w-32 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Time
                </th>
                <th
                  scope="col"
                  className="px-2 py-3 w-32 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Market ID
                </th>
                <th
                  scope="col"
                  className="px-2 py-5 w-32 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Proposition ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <BetRows
                myBetsSelected={myBetsEnabled}
                bets={betHistory}
                onClickBet={onClickBet}
                config={config}
                isConnected={isConnected}
              />
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
};
