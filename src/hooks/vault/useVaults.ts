import { useContractRead, useContractReads } from "wagmi";
import registryContractJson from "../../abi/Registry.json";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import api from "../../apis/Api";

const registryContractAddress = process.env.VITE_REGISTRY_CONTRACT;
if (!registryContractAddress)
  throw new Error("No VITE_REGISTRY_CONTRACT provided");

const registryContract = {
  address: registryContractAddress,
  abi: registryContractJson.abi
};

const useVaultAddresesFromContract = () => {
  const { data: vaultCountData } = useContractRead({
    ...registryContract,
    functionName: "vaultCount"
  });

  const vaultCountStr =
    vaultCountData && ethers.utils.formatUnits(vaultCountData as BigNumber, 0);
  const vaultCount = parseInt((vaultCountStr as string) ?? "0");

  const { data: vaultsData } = useContractReads({
    contracts: Array.from({ length: vaultCount }, (_, i) => {
      return {
        ...registryContract,
        functionName: "vaults",
        args: [i]
      };
    })
  });

  const vaultAddresses = vaultsData?.filter(v => v) ?? [];

  return { vaultAddresses: vaultAddresses as unknown as string[] };
};

const useVaultAddresesFromAPI = () => {
  const [vaultAddresses, setVaultAddresses] = useState<string[]>([]);
  useEffect(() => {
    const load = async () => {
      const vaultAddresses = await api.getVaultAddresses();
      setVaultAddresses(vaultAddresses);
    };
    load();
  }, []);

  return { vaultAddresses: vaultAddresses as unknown as string[] };
};

const shouldUseAPI = process.env.VITE_REST_FOR_VAULTS;

const useVaults = () => {
  if (shouldUseAPI) {
    const { vaultAddresses } = useVaultAddresesFromAPI();
    return { vaultAddresses };
  }
  const { vaultAddresses } = useVaultAddresesFromContract();
  return { vaultAddresses };
};

export default useVaults;
