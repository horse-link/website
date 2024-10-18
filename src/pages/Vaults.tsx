import React, { useState } from "react";
import { VaultHistoryTable, VaultsTable } from "../components/Tables";
import { useSubgraphVaults } from "../hooks/subgraph";
import { DepositVaultModal, WithdrawVaultModal } from "../components/Modals";
import { VaultModalState, VaultTransactionType } from "../types/vaults";
import { Card, PageLayout } from "../components";
import { ethers } from "ethers";
import { useVaultStatistics } from "../hooks/stats";
import { formatting } from "horselink-sdk";

const Vaults: React.FC = () => {
  const [modal, setModal] = useState<VaultModalState>();
  const vaultHistory = useSubgraphVaults();

  const closeModal = () => setModal(undefined);
  const {
    totalVaultDeposits,
    totalVaultWithdrawals,
    totalVaultVolume,
    totalVaultsExposure
  } = useVaultStatistics();

  return (
    <PageLayout>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card
          title="24H Vault Volume"
          data={
            totalVaultVolume
              ? `$${formatting.formatToFourDecimals(
                  ethers.formatEther(totalVaultVolume)
                )}`
              : "-"
          }
        />
        <Card
          title="Total Vault Exposure"
          data={
            totalVaultsExposure
              ? `$${formatting.formatToFourDecimals(
                  ethers.formatEther(totalVaultsExposure)
                )}`
              : "-" // Fallback
          }
        />
        <Card
          title="24H Deposits"
          data={
            totalVaultDeposits
              ? `$${formatting.formatToFourDecimals(
                  ethers.formatEther(totalVaultDeposits)
                )}`
              : "-" // Fallback
          }
        />
        <Card
          title="24H Withdrawals"
          data={
            totalVaultWithdrawals
              ? `$${formatting.formatToFourDecimals(
                  ethers.formatEther(totalVaultWithdrawals)
                )}`
              : "-"
          }
        />
      </div>
      <div className="mt-10">
        <h2>VAULTS & LIQUIDITY POOLS</h2>
      </div>
      <div className="mt-4">
        <VaultsTable setIsModalOpen={setModal} />
      </div>
      <div className="mt-10">
        <h2>HISTORY</h2>
      </div>
      <div className="mt-4">
        <VaultHistoryTable vaultHistory={vaultHistory} />
      </div>
      {modal &&
        (modal.type === VaultTransactionType.DEPOSIT ? (
          <DepositVaultModal
            isModalOpen={!!modal}
            closeModal={closeModal}
            vault={modal.vault}
          />
        ) : (
          <WithdrawVaultModal
            isModalOpen={!!modal}
            closeModal={closeModal}
            vault={modal.vault}
          />
        ))}
      <div className="block py-10 lg:hidden" />
    </PageLayout>
  );
};

export default Vaults;
