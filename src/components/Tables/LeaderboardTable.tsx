import { ethers } from "ethers";
import React from "react";
import { LeaderboardBalance } from "../../types/leaderboard";
import classNames from "classnames";
import { Table } from "./Table";
import { formatting } from "horselink-sdk";

type Props = {
  stats?: Array<{
    address: string;
    value: bigint;
  }>;
  balances?: Array<LeaderboardBalance>;
  loading: boolean;
};

export const LeaderboardTable: React.FC<Props> = ({ stats, balances }) => {
  const headers = ["Rank", "Address", "Earnings", "Balance"].map((text, i) => (
    <div
      key={`markettable-${text}-${i}`}
      className={classNames(
        "w-full py-4 text-left font-semibold text-hl-primary",
        {
          "!text-hl-secondary": i === 1
        }
      )}
    >
      {text}
    </div>
  ));

  const rows =
    stats && balances
      ? stats.map((stat, i) => {
          const balance = balances.find(
            bal => bal.address.toLowerCase() === stat.address.toLowerCase()
          );
          if (!balance)
            throw new Error(
              `Could not find a balance for address, ${stat.address}`
            );

          const style = "w-full text-left py-4";

          const earnings = `${formatting.formatToFourDecimalsRaw(
            ethers.formatEther(stat.value)
          )} HL`;

          const bal = `${formatting.formatToFourDecimals(
            balance.formatted
          )} HL`;

          const data = [(i + 1).toString(), stat.address, earnings, bal];

          return data.map((text, i) => (
            <div
              key={`leaderboardtable-rows-${text}-${i}`}
              className={classNames(style, {
                "!text-hl-secondary": i === 1
              })}
            >
              {text}
            </div>
          ));
        })
      : [];

  return !stats?.length ? (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <p className="text-2xl font-bold">
        No contenders have joined the leaderboard yet.
      </p>
    </div>
  ) : (
    <Table
      headers={headers}
      headerStyles="font-basement tracking-wider"
      rows={rows}
    />
  );
};
