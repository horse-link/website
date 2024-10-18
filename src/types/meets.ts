import { EcSignature } from "./general";
import { RaceInfo } from "horselink-sdk";

// export type Meet = {
//   id: string;
//   name: string;
//   location: string;
//   date: string;
//   races: Race[];
// };

// export type MeetResponse = {
//   nonce: string;
//   created: number;
//   expires: number;
//   meetings: Meet[];
// };

export type MeetInfo = {
  meetingName: string;
  location: string;
  raceType: string;
  meetingDate: string;
  weatherCondition: string | null;
  trackCondition: string | null;
  railPosition: string | null;
  venueMnemonic: string;
  raceInfo: RaceInfo[];
};

export type Back = {
  nonce: string;
  market_id: string;
  close: number;
  end: number;
  odds: number; // win or place
  proposition_id: string;
  signature: EcSignature;
};

// The parameters for a call to back() on the Market contract.
// Same as Back but with a wager attribute
export type BackParams = Back & {
  wager: bigint;
};
