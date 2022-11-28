import { BetHistory, BetStatus, SignedBetDataResponse } from "src/types";
import { Bet } from "src/types/entities";
import { formatBetId } from "./formatting";

export const calculateMaxPages = (betsArrayLength: number, totalBets: number) =>
  Math.ceil(totalBets / betsArrayLength);

export const incrementPage = (page: number, maxPages: number) =>
  page + 1 > maxPages || page + 1 < 1 ? maxPages : page + 1;

export const decrementPage = (page: number, maxPages: number) =>
  page - 1 < 1 || page - 1 > maxPages ? maxPages : page - 1;

const getBetStatus = (
  bet: Bet,
  signedBetData: SignedBetDataResponse
): BetStatus => {
  const hasResult =
    signedBetData.winningPropositionId || signedBetData.marketResultAdded;
  if (!hasResult && !bet.settled) return "PENDING";
  if (hasResult && !bet.settled) return "RESULTED";
  if (hasResult && bet.settled) return "SETTLED";
  throw new Error("Invalid bet status");
};

export const handleBetHistory = (
  bet: Bet,
  signedBetData: SignedBetDataResponse
): BetHistory => ({
  index: formatBetId(bet.id),
  marketId: bet.marketId.toLowerCase(),
  marketAddress: bet.marketAddress.toLowerCase(),
  assetAddress: bet.assetAddress.toLowerCase(),
  propositionId: bet.propositionId.toLowerCase(),
  winningPropositionId: signedBetData.winningPropositionId,
  marketResultAdded: signedBetData.marketResultAdded,
  settled: bet.settled,
  punter: bet.owner.toLowerCase(),
  amount: bet.amount,
  payout: bet.payout,
  tx: bet.createdAtTx.toLowerCase(),
  blockNumber: +bet.createdAt,
  settledAt: bet.settled ? +bet.settledAt : undefined,
  marketOracleResultSig: signedBetData.marketOracleResultSig,
  status: getBetStatus(bet, signedBetData)
});
