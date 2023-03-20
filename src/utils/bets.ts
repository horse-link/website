import { ethers } from "ethers";
import utils from ".";
import {
  BetFilterOptions,
  BetHistory,
  BetStatus,
  ScratchedRunner,
  SignedBetDataResponse
} from "../types/bets";
import { Config } from "../types/config";
import { Bet } from "../types/subgraph";
import { EcSignature } from "../types/general";

export const calculateMaxPages = (betsArrayLength: number, totalBets: number) =>
  Math.ceil(totalBets / betsArrayLength);

export const incrementPage = (page: number, maxPages: number) =>
  page + 1 > maxPages || page + 1 < 1 ? maxPages : page + 1;

export const decrementPage = (page: number, maxPages: number) =>
  page - 1 < 1 || page - 1 > maxPages ? maxPages : page - 1;

export const getBetStatus = (
  bet: Bet,
  signedBetData: SignedBetDataResponse,
  scratched?: ScratchedRunner
): BetStatus => {
  // if the bet is settled
  if (bet.settled) return "SETTLED";

  // if the bet is scratched
  if (scratched) return "SCRATCHED";

  // if the payout date is in the future
  if (+bet.payoutAt > Math.floor(Date.now() / 1000)) return "PENDING";

  // if there is a winning proposition id, race is resulted
  if (signedBetData.winningPropositionId) {
    return "RESULTED";
  } else {
    return "INVALID";
  }
};

export const getBetHistory = (
  bet: Bet,
  signedBetData: SignedBetDataResponse
): BetHistory => {
  const scratched = signedBetData?.scratchedRunners?.find(
    scratched =>
      scratched.b16propositionId.toLowerCase() ===
      bet.propositionId.toLowerCase()
  );

  return {
    index: utils.formatting.formatBetId(bet.id),
    marketId: bet.marketId.toLowerCase(),
    marketAddress: bet.marketAddress.toLowerCase(),
    assetAddress: bet.assetAddress.toLowerCase(),
    propositionId: bet.propositionId.toLowerCase(),
    winningPropositionId: signedBetData.winningPropositionId,
    marketResultAdded: signedBetData.marketResultAdded,
    settled: bet.settled,
    punter: bet.owner.toLowerCase(),
    payoutDate: +bet.payoutAt,
    amount: bet.amount,
    payout: bet.payout,
    tx: bet.createdAtTx.toLowerCase(),
    blockNumber: +bet.createdAt,
    settledAt: bet.settled ? +bet.settledAt : undefined,
    marketOracleResultSig: signedBetData.marketOracleResultSig,
    scratched: scratched,
    status: getBetStatus(bet, signedBetData, scratched)
  };
};

export const filterBetsByFilterOptions = (
  bets: BetHistory[],
  filter: BetFilterOptions
) => {
  if (filter === "ALL_BETS") return bets;
  return bets.filter(bet => bet.status === filter);
};

export const recoverSigSigner = (
  marketId: string,
  propositionId: string,
  signature: EcSignature,
  config: Config,
  odds?: ethers.BigNumber,
  totalOdds?: ethers.BigNumber
) => {
  let messageHash;
  if (odds && totalOdds) {
    messageHash = ethers.utils.solidityKeccak256(
      ["bytes16", "bytes16", "uint256", "uint256"],
      [marketId, propositionId, odds, totalOdds]
    );
  } else {
    messageHash = ethers.utils.solidityKeccak256(
      ["bytes16", "bytes16"],
      [marketId, propositionId]
    );
  }
  const address = ethers.utils.verifyMessage(
    ethers.utils.arrayify(messageHash),
    signature
  );
  return address.toLowerCase() === config.addresses.ownerAddress.toLowerCase();
};
