import React, { useEffect, useState } from "react";
import { Card, PageLayout } from "../components";
import { useLeaderboardStatistics } from "../hooks/stats";
import { LeaderboardTable } from "../components/Tables";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Countdown } from "../components/Countdown";
import constants from "../constants";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { formatting } from "horselink-sdk";

dayjs.extend(duration);

const Leaderboard: React.FC = () => {
  const { stats, balances, userStats, loading } = useLeaderboardStatistics();
  const { isConnected } = useAccount();

  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();
  const [now, setNow] = useState(Date.now());

  const eventTimestamp = +(constants.env.EVENT_TS || "0");
  const isEventInFuture = dayjs(now).isBefore(dayjs(eventTimestamp));

  useEffect(() => {
    const interval = setInterval(
      () => setNow(Date.now()),
      1 * constants.time.ONE_SECOND_MS
    );
    setIntervalId(interval);

    return () => {
      clearInterval(interval);
      setIntervalId(undefined);
    };
  }, []);

  // clear interval if event is no longer in future
  useEffect(() => {
    if (!isEventInFuture && intervalId) {
      clearInterval(intervalId);
      setIntervalId(undefined);
    }
  }, [isEventInFuture]);

  const userHasNoStats = isConnected && !userStats;

  const earnings = userStats?.earnings.value
    ? `${formatting.formatToFourDecimalsRaw(
        ethers.formatEther(userStats.earnings.value)
      )} HL`
    : undefined;

  const balance = userStats?.balance.formatted
    ? `${formatting.formatToFourDecimals(userStats.balance.formatted)} HL`
    : undefined;

  return (
    <PageLayout>
      {!isEventInFuture ? (
        <React.Fragment>
          {isConnected && (
            <div className="mb-4 flex w-full flex-col justify-center gap-x-1 gap-y-2 text-left md:flex-row lg:justify-between lg:gap-x-4">
              <Card
                title="Your Rank"
                data={userHasNoStats ? "N/A" : userStats?.rank.toString()}
              />
              <Card
                title="Your Earnings"
                data={userHasNoStats ? "0" : earnings}
              />
              <Card
                title="Your Balance"
                data={userHasNoStats ? "0" : balance}
              />
            </div>
          )}
          <LeaderboardTable
            stats={stats}
            balances={balances}
            loading={loading}
          />
        </React.Fragment>
      ) : (
        <Countdown
          eventTimestamp={eventTimestamp}
          now={now}
          isEventInFuture={isEventInFuture}
        />
      )}
    </PageLayout>
  );
};

export default Leaderboard;
