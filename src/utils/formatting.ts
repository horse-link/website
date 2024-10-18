import dayjs from "dayjs";
import { MeetInfo } from "../types/meets";
import { BetId, Deposit, Withdraw } from "../types/subgraph";
import { Chain } from "viem/chains";
import { VaultTransaction } from "../types/vaults";

// add a comma every 3 digits
export const formatNumberWithCommas = (amount: string) => {
  const parsedAmount = parseFloat(amount);
  const formatToFourDecimal = parsedAmount.toFixed(6);
  const roundedToFourDecimal = +formatToFourDecimal;
  const convertToFourDecimalsWithCommas = roundedToFourDecimal.toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 4,
      minimumFractionDigits: 4
    }
  );
  return convertToFourDecimalsWithCommas;
};

/**
 * @deprecated
 */
export const formatBetId = (betId: BetId) => {
  const segments = betId.split("_");
  return +segments[2];
};

// Deprecated
export const formatTimeToHMS = (time: string, shortForm?: boolean) => {
  const now = dayjs();

  // time is less than 5 mins
  return formatTimeToHMSFromNow(now, time, shortForm);
};

export const formatTimeToHMSFromNow = (
  now: dayjs.Dayjs,
  time: string,
  shortForm?: boolean
): string => {
  const date = dayjs(time);

  const isNegative = now > date;
  const prefix = isNegative ? "-" : "";

  const hours = date.diff(now, "hours");
  const minutes = date.diff(now.add(hours, "hours"), "minutes");
  const seconds = date.diff(
    now.add(hours, "hours").add(minutes, "minutes"),
    "seconds"
  );

  // return longform H M S
  if (!shortForm)
    return `${prefix}${Math.abs(hours)}h ${Math.abs(minutes)}m ${Math.abs(
      seconds
    )}s`;

  // if time > 2 hours
  if (Math.abs(hours) > 2) {
    const shortformHours = minutes > 30 ? hours + 1 : hours;
    return `${prefix}${Math.abs(shortformHours)}h`;
  }

  // if time is between 1 and 2 hours
  if (Math.abs(hours) >= 1)
    return `${prefix}${Math.abs(hours)}h ${Math.abs(minutes)}m`;

  // if time is less than 1 hour but over 5 minutes
  if (Math.abs(hours) < 1 && minutes >= 5)
    return `${prefix}${Math.abs(minutes)}m`;

  // time is less than 5 mins
  return `${prefix}${Math.abs(minutes)}m ${Math.abs(seconds)}s`;
};

export const formatTrackCondition = (meetRaces: MeetInfo) => {
  if (!meetRaces.trackCondition) return;

  const LookupMap: Map<string, string> = new Map([
    ["GOOD", "GOOD"],
    ["GOOD3", "GOOD (3)"],
    ["GOOD4", "GOOD (4)"],
    ["FIRM1", "FIRM (1)"],
    ["FIRM2", "FIRM (2)"],
    ["SOFT5", "SOFT (5)"],
    ["SOFT6", "SOFT (6)"],
    ["SOFT7", "SOFT (7)"],
    ["HVY8", "HEAVY (8)"],
    ["HVY9", "HEAVY (9)"],
    ["HVY10", "HEAVY (10)"],
    ["SYNTHETIC", "Synthetic"],
    ["UNKNOWN", "Unknown"]
  ]);

  return LookupMap.get(meetRaces.trackCondition.toUpperCase());
};

export const formatOrdinals = (n: number) => {
  const pr = new Intl.PluralRules("en-US", { type: "ordinal" });

  const suffixes = new Map([
    ["one", "st"],
    ["two", "nd"],
    ["few", "rd"],
    ["other", "th"]
  ]);
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
};

export const formatChain = (chain: Chain): Partial<Chain> => ({
  ...chain,
  // take out spaces and capitals
  name: chain.name.split(" ")[0].toLowerCase()
});

export const formatVaultTransactionIntoDeposit = ({
  id,
  vaultAddress,
  userAddress,
  amount,
  timestamp
}: VaultTransaction): Partial<Deposit> => ({
  id,
  vault: vaultAddress,
  sender: userAddress,
  assets: amount,
  createdAt: timestamp
});

export const formatVaultTransactionIntoWithdraw = ({
  id,
  vaultAddress,
  userAddress,
  amount,
  timestamp
}: VaultTransaction): Partial<Withdraw> => ({
  id,
  vault: vaultAddress,
  sender: userAddress,
  assets: amount,
  createdAt: timestamp
});
