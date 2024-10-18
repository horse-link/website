import { useMarketStatistics } from "../hooks/stats";
import { ethers } from "ethers";
import { PageLayout, Card } from "../components";
import { MarketHistoryTable, MarketTable } from "../components/Tables";
import { formatting } from "horselink-sdk";

const Markets: React.FC = () => {
  const { profit, totalBets, totalVolume, largestBet } = useMarketStatistics();

  return (
    <PageLayout>
      <div className="mb-4 flex w-full flex-col justify-center gap-x-1 gap-y-2 text-left md:flex-row lg:justify-between lg:gap-x-4">
        <Card
          title="24H Volume"
          data={
            (totalVolume &&
              `$${formatting.formatToFourDecimals(
                ethers.formatEther(totalVolume?.toString())
              )}`) ||
            "-" // Fallback
          }
        />
        <Card title="24H Bets" data={totalBets?.toString()} />
        <Card
          title="Profit/Loss"
          data={
            (profit &&
              `$${formatting.formatToFourDecimals(
                ethers.formatEther(profit?.toString())
              )}`) ||
            "-" // Fallback
          }
        />
        <Card
          title="24H Largest Bet"
          data={
            (largestBet &&
              `$${formatting.formatToFourDecimals(
                ethers.formatEther(largestBet?.toString())
              )}`) ||
            "-"
          }
        />
      </div>
      <MarketTable />
      <div className="mt-10">
        <h2>HISTORY</h2>
      </div>
      <div className="mt-4">
        <MarketHistoryTable />
      </div>
      <div className="block py-10 lg:hidden" />
    </PageLayout>
  );
};

export default Markets;
