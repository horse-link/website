import { Chain } from "viem/chains";

export type EcSignature = {
  v: number;
  r: string;
  s: string;
};

export type SignedResponse = {
  owner: string;
  signature: string;
  // hash: string;
};

export type Signature = {
  message: string;
  messageHash: string;
  signature: string;
};

export type SvgIcon = React.FunctionComponent<
  React.SVGProps<SVGSVGElement> & {
    title?: string | undefined;
  }
>;

export type Network = Chain & { unsupported?: boolean };
