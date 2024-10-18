import { usePublicClient } from "wagmi";
import { Address, erc20Abi } from "viem";

export const useERC20Contract = () => {
  const publicClient = usePublicClient();

  if (!publicClient) return null;

  const getBalance = async (tokenAddress: Address, userAddress: Address) => {
    const balance = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress]
    });

    return balance;
  };

  const getDecimals = async (tokenAddress: Address) => {
    const decimals = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals"
    });

    return decimals;
  };

  return {
    getBalance,
    getDecimals
  };
};
