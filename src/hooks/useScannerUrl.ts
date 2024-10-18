import { useAccount } from "wagmi";

export const useScannerUrl = () => {
  const { chain } = useAccount();
  const url = chain?.blockExplorers?.default.url ?? "https://google.com?q=";
  return url;
};
