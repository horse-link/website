import { ErrorCode } from "ethers";

enum ContractError {
  BackInvalidDate = "back: Invalid date",
  BackInvalidSignature = "back: Invalid signature",
  BackOracleAlreadySet = "back: Oracle result already set for this market",
  BackPayoutDateNotReached = "payout: Payout date not reached",
  BetAlreadySettled = "Bet has already settled",
  OracleCheckResultNotSet = "checkResult: Invalid propositionId",
  OracleGetResultNotSet = "getResult: Invalid propositionId",
  OracleSetResultAlreadySet = "setResult: Result already set",
  OracleSetResultInvalidPropositionId = "setResult: Invalid propositionId",
  OracleSetResultInvalidSignature = "setResult: Invalid signature",
  OracleSetScratchedResultAlreadySet = "setScratchedResult: Result already set",
  OracleSetScratchedResultInvalidPropositionId = "setScratchedResult: Invalid propositionId",
  OracleSetScratchedResultInvalidSignature = "setScratchedResult: Invalid signature",
  VaultTransferLockedTimeNotPassed = "transfer: Locked time not passed",
  VaultWithdrawLockedTimeNotPassed = "withdraw: Locked time not passed"
}

const contractErrorLookup: Record<ContractError, string> = {
  [ContractError.BackInvalidDate]: "Betting has closed on this race.",
  [ContractError.BackInvalidSignature]:
    "We weren't able to verify your bet. Please refresh the page and try again. If the issue persists, please contact us.",
  [ContractError.BackOracleAlreadySet]:
    "Someone else has already registered the result for this race. Please try again.",
  [ContractError.BackPayoutDateNotReached]:
    "This race is not paying out yet. Please wait.",
  [ContractError.BetAlreadySettled]: "No worries! The bet has already settled.",
  [ContractError.OracleCheckResultNotSet]:
    "The result for this race has not been registered yet.",
  [ContractError.OracleGetResultNotSet]:
    "The result for this race has not been registered yet.",
  [ContractError.OracleSetResultAlreadySet]:
    "The result has already been set for this race.",
  [ContractError.OracleSetResultInvalidPropositionId]:
    "Something went wrong while registering the result for this race. Please refresh the page and try again. If the issue persists, please contact us.",
  [ContractError.OracleSetResultInvalidSignature]:
    "We weren't able to verify your transaction to set the result for this race. Please refresh the page and try again. If the issue persists, please contact us.",
  [ContractError.OracleSetScratchedResultAlreadySet]:
    "Someone else already registered the scratched runner. Please try again.",
  [ContractError.OracleSetScratchedResultInvalidPropositionId]:
    "Something went wrong while registering a scratched runner. Please refresh the page and try again. If the issue persists, please contact us.",
  [ContractError.OracleSetScratchedResultInvalidSignature]:
    "We weren't able to verify your transaction to register a scratched runner. Please refresh the page and try again. If the issue persists, please contact us.",
  [ContractError.VaultTransferLockedTimeNotPassed]:
    "You can't redeem your vault shares yet. You must wait until the locked period has elapsed.",
  [ContractError.VaultWithdrawLockedTimeNotPassed]:
    "You can't trade your vault shares yet. You must wait until the locked period has elapsed."
};

const DEFAULT_BLOCKCHAIN_ERROR =
  "Something went wrong while processing your transaction. Please refresh the page and try again. If the issue persists, please contact us.";
const DEFAULT_ERROR_MESSAGE =
  "Something went wrong. Please refresh the page and try again. If the issue persists, please contact us.";

const ethersErrorLookup: Record<ErrorCode, string> = {
  ACTION_REJECTED:
    "It looks like you rejected the transaction. Please try again.",
  NETWORK_ERROR:
    "We're having trouble connecting to the network. Please check your internet connection and try again.",
  INSUFFICIENT_FUNDS:
    "You don't have enough 'gas' to send this transaction. You can get some more through the faucet.",
  CALL_EXCEPTION: DEFAULT_BLOCKCHAIN_ERROR,
  SERVER_ERROR: DEFAULT_BLOCKCHAIN_ERROR,
  TIMEOUT:
    "We're having trouble connecting to the network. Please check your internet connection and try again.",
  UNKNOWN_ERROR: DEFAULT_BLOCKCHAIN_ERROR,
  NOT_IMPLEMENTED: DEFAULT_BLOCKCHAIN_ERROR,
  UNSUPPORTED_OPERATION: DEFAULT_BLOCKCHAIN_ERROR,
  BUFFER_OVERRUN: DEFAULT_BLOCKCHAIN_ERROR,
  NUMERIC_FAULT: DEFAULT_BLOCKCHAIN_ERROR,
  INVALID_ARGUMENT: DEFAULT_BLOCKCHAIN_ERROR,
  MISSING_ARGUMENT: DEFAULT_BLOCKCHAIN_ERROR,
  UNEXPECTED_ARGUMENT: DEFAULT_BLOCKCHAIN_ERROR,
  NONCE_EXPIRED: DEFAULT_BLOCKCHAIN_ERROR,
  REPLACEMENT_UNDERPRICED: DEFAULT_BLOCKCHAIN_ERROR,
  TRANSACTION_REPLACED: DEFAULT_BLOCKCHAIN_ERROR,
  UNCONFIGURED_NAME: DEFAULT_BLOCKCHAIN_ERROR,
  OFFCHAIN_FAULT: DEFAULT_BLOCKCHAIN_ERROR,
  BAD_DATA: DEFAULT_BLOCKCHAIN_ERROR,
  CANCELLED: DEFAULT_BLOCKCHAIN_ERROR,
  VALUE_MISMATCH: DEFAULT_BLOCKCHAIN_ERROR
};

export const getMeaningfulMessage = (error: any) => {
  console.error(error);
  const stringified = JSON.stringify(error.message).toLowerCase();
  const contractError = Object.keys(contractErrorLookup).find(key =>
    stringified.includes(key.toLowerCase())
  );
  if (contractError) {
    return contractErrorLookup[contractError as ContractError];
  }
  if (error?.code && error.code in ethersErrorLookup) {
    return ethersErrorLookup[error.code as keyof typeof ethersErrorLookup];
  }
  return DEFAULT_ERROR_MESSAGE;
};
