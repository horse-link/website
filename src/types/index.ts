export type Back = {
  nonce: string;
  market_id: string;
  close: number;
  end: number;
  odds: number;
  proposition_id: string;
  signature: string;
};

export type BetHistory = {
  amount: number;
  market_id: string;
  odds: number;
  proposition_id: string;
  punter: string;
  result: string;
  tx: string;
};

export type BetHistoryResponse = {
  results: BetHistory[];
};

export type SignedResponse = {
  owner: string;
  signature: string;
  // hash: string;
};

export type SignedRunnersResponse = {
  data: Runner[];
} & SignedResponse;

export type SignedMeetingsResponse = {
  data: MeetResponse;
} & SignedResponse;

export type MeetResponse = {
  nonce: string;
  created: number;
  expires: number;
  meetings: Meet[];
};

export type Meet = {
  id: string;
  name: string;
  location: string;
  races: Race[];
};

export type Race = {
  number: number;
  name: string;
  start: Date;
};

export type Runner = {
  number: number;
  name: string;
  nonce: string;
  market_id: string;
  close: number;
  end: number;
  odds: number;
  proposition_id: string;
  proposition_id_hash: string;
  barrier: number;
  signature: Signature;
};

export type Signature = {
  message: string;
  messageHash: string;
  signature: string;
};
