import { useContractInfiniteReads, useContractRead } from "wagmi";
import VaultsView from "./Vaults_View";
import registryContractJson from "../../abi/Registry.json";
import { ethers } from "ethers";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const registryContract = {
  addressOrName: "0x5Df377d600A40fB6723e4Bf10FD5ee70e93578da",
  contractInterface: registryContractJson.abi
};
const Vaults: React.FC = () => {
  const { data: vaultCountData } = useContractRead({
    ...registryContract,
    functionName: "vaultCount"
  });

  const vaultCountStr =
    vaultCountData && ethers.utils.formatUnits(vaultCountData, 0);

  const { data: vaultDataList, fetchNextPage } = useContractInfiniteReads({
    cacheKey: "vaultDataList",
    contracts: (param = 0) => [
      {
        ...registryContract,
        functionName: "vaults",
        args: [param]
      }
    ],
    getNextPageParam: (_, pages) => pages.length
  });
  useEffect(() => {
    const vaultCount = parseInt(vaultCountStr ?? "0");
    const dataLength = vaultDataList?.pages.length;
    if (!fetchNextPage || !dataLength) return;
    if (dataLength < vaultCount) {
      fetchNextPage();
    }
  }, [vaultCountStr, fetchNextPage, vaultDataList]);

  const vaultAddressList =
    vaultDataList?.pages.map(arr => arr[0]).filter(v => v) ?? [];

  const navigate = useNavigate();
  const onClickVault = (vaultAddress: string) => {
    navigate(`/vaults/${vaultAddress}`);
  };

  return (
    <VaultsView
      vaultAddressList={vaultAddressList}
      onClickVault={onClickVault}
    />
  );
};

export default Vaults;
