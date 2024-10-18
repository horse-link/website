import { ethers } from "ethers";
import { Card } from "..";
import { useUserStatistics } from "../../hooks/stats";
import utils from "../../utils";

export const HomeUserStats: React.FC = () => {
  const stats = useUserStatistics();

  const formattedDeposits = stats?.totalDeposited
    ? `$${utils.formatting.formatNumberWithCommas(
        ethers.formatEther(stats.totalDeposited)
      )}`
    : undefined;

  const formattedInplay = stats?.inPlay
    ? `$${utils.formatting.formatNumberWithCommas(
        ethers.formatEther(stats.inPlay)
      )}`
    : undefined;

  const formattedProfits = stats?.pnl
    ? `$${utils.formatting.formatNumberWithCommas(
        ethers.formatEther(stats.pnl)
      )}`
    : undefined;

  return (
    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <Card title="Deposits" data={formattedDeposits} />
      <Card title="In Play" data={formattedInplay} />
      <Card title="Profits" data={formattedProfits} />
    </dl>
  );
};
