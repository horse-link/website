import React, { useEffect, useState } from "react";
import { BaseTable } from ".";
import { TableData, TableHeader, TableRow } from "../../types/table";
import { Config, VaultInfo } from "../../types/config";
import {
  VaultModalState,
  VaultTransactionType,
  VaultUserData
} from "../../types/vaults";
import { Address, useAccount, useSigner } from "wagmi";
import { useWalletModal } from "../../providers/WalletModal";
import utils from "../../utils";
import { BigNumber, ethers } from "ethers";
import { VaultActionButton } from "../Buttons";
import Skeleton from "react-loading-skeleton";
import { useVaultContract } from "../../hooks/contracts";
import { useScannerUrl } from "../../hooks/useScannerUrl";

type Props = {
  config?: Config;
  setIsModalOpen: (state: VaultModalState) => void;
};

export const VaultListTable: React.FC<Props> = ({ config, setIsModalOpen }) => {
  const { isConnected } = useAccount();
  const { openWalletModal } = useWalletModal();
  const { data: signer } = useSigner();
  const [userData, setUserData] = useState<Record<string, VaultUserData>>();
  const scanner = useScannerUrl();

  const { getIndividualShareTotal, getIndividualAssetTotal, getSupplyTotal } =
    useVaultContract();

  useEffect(() => {
    if (!isConnected || !config || !signer) {
      //If a user is disconnected we show the skeleton
      setUserData(undefined);
      return;
    }
    (async () => {
      const individualRecords: Record<string, VaultUserData> = {};

      await Promise.all(
        config.vaults.map(async (vault: VaultInfo) => {
          const shareTotal = await getIndividualShareTotal(vault, signer);
          const assetTotal = await getIndividualAssetTotal(vault, signer);
          const totalSupply = await getSupplyTotal(vault, signer);
          const percentageTotal = ethers.utils.formatUnits(
            shareTotal.mul(100).mul(100).div(totalSupply), //the second multiplication is the precision
            2
          );

          individualRecords[vault.address] = {
            percentage: percentageTotal,
            userShareBalance: shareTotal,
            userAssetBalance: assetTotal
          };
        })
      );
      setUserData(individualRecords);
    })();
  }, [config, isConnected, signer]);

  const getVaultListData = (vault: VaultInfo): TableData[] => [
    {
      title: vault.name,
      classNames: "!pl-5 !pr-2 bg-gray-200"
    },
    {
      title: vault.asset.symbol
    },
    {
      title: `$${utils.formatting.formatToFourDecimals(
        ethers.utils.formatUnits(vault.totalAssets, vault.asset.decimals)
      )}`
    },
    {
      title: userData ? (
        `${utils.formatting.formatToFourDecimals(
          ethers.utils.formatUnits(
            userData[vault.address].userShareBalance,
            vault.asset.decimals
          )
        )}`
      ) : (
        <Skeleton />
      )
    },
    {
      title: userData ? (
        `$${utils.formatting.formatToFourDecimals(
          ethers.utils.formatUnits(
            userData[vault.address].userAssetBalance,
            vault.asset.decimals
          )
        )}`
      ) : (
        <Skeleton />
      )
    },
    {
      title: userData ? (
        `${
          +userData[vault.address].percentage < 1 &&
          +userData[vault.address].percentage > 0
            ? `<1`
            : userData[vault.address].percentage
        }%`
      ) : (
        <Skeleton />
      )
    },
    {
      title: (
        <a
          href={`${scanner}/address/${vault.address}`}
          target="_blank"
          rel="noreferrer noopener"
          className="hyperlink"
        >
          {vault.address}
        </a>
      )
    },
    {
      title: (
        <React.Fragment>
          <VaultActionButton
            title="DEPOSIT"
            vault={vault}
            isConnected={isConnected}
            openWalletModal={openWalletModal}
            setIsModalOpen={setIsModalOpen}
            type={VaultTransactionType.DEPOSIT}
          />
          <VaultActionButton
            title="WITHDRAW"
            vault={vault}
            isConnected={isConnected}
            openWalletModal={openWalletModal}
            setIsModalOpen={setIsModalOpen}
            type={VaultTransactionType.WITHDRAW}
          />
        </React.Fragment>
      ),
      classNames: "text-right"
    }
  ];

  const HEADERS: TableHeader[] = [
    {
      title: "Name",
      classNames: "!pl-5 !pr-2 bg-gray-200 !w-[10rem]"
    },
    {
      title: "Token"
    },
    {
      title: "TVL"
    },
    {
      title: "My Shares"
    },
    {
      title: "My Value"
    },
    {
      title: "My Percentage"
    },
    {
      title: "Vault Address"
    },
    {
      title: "Deposit / Withdraw",
      classNames: "text-right !pr-6"
    }
  ];

  const ROWS: TableRow[] = config
    ? config.vaults.map(vault => ({
        data: getVaultListData(vault)
      }))
    : utils.tables.getBlankRow(<Skeleton />, HEADERS.length, 0);

  return (
    <BaseTable title="Vaults / Liquidity Pools" headers={HEADERS} rows={ROWS} />
  );
};
