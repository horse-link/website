export type LeaderboardStat = {
  address: string;
  value: bigint;
};

export type LeaderboardBalance = {
  address: string;
  value: bigint;
  decimals: number;
  formatted: string;
};

export type LeaderboardUserBalance = Pick<LeaderboardBalance, "address"> & {
  balance: {
    value: bigint;
    decimals: number;
    formatted: string;
  };
  earnings: {
    value: bigint;
    decimals: number;
    formatted: string;
  };
  rank: number;
};
