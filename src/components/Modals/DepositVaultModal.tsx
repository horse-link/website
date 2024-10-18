import React, { useEffect, useState } from "react";
import { useSigner } from "wagmi";
import { VaultInfo } from "horselink-sdk";
import { BaseModal } from ".";
import { ethers } from "ethers";
import { Web3ErrorHandler, Web3SuccessHandler } from "../Web3Handlers";
import { useVaultContract, useERC20Contract } from "../../hooks/contracts";
import useRefetch from "../../hooks/useRefetch";
import { UserBalance } from "../../types/users";
import { Loader } from "../";
import { Button } from "../Buttons";
import { formatting } from "horselink-sdk";
import { useScannerUrl } from "../../hooks/useScannerUrl";

type Props = {
  isModalOpen: boolean;
  closeModal: () => void;
  vault: VaultInfo;
};

export const DepositVaultModal: React.FC<Props> = ({
  isModalOpen,
  closeModal,
  vault
}) => {
  const [depositAmount, setDepositAmount] = useState<string>();
  const [userBalance, setUserBalance] = useState<UserBalance>();
  const [txLoading, setTxLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<ethers.errors>();

  const { data: signer } = useSigner();

  const { deposit } = useVaultContract();
  const { getBalance, getDecimals } = useERC20Contract();
  const { shouldRefetch, refetch: refetchUserBalance } = useRefetch();

  useEffect(() => {
    if (!signer) return;

    (async () => {
      setUserBalance(undefined);
      const assetAddress = vault.asset.address;
      const [balance, decimals] = await Promise.all([
        getBalance(assetAddress, signer),
        getDecimals(assetAddress, signer)
      ]);

      setUserBalance({
        value: balance,
        decimals,
        formatted: formatting.formatToFourDecimals(
          ethers.formatUnits(balance, decimals)
        )
      });
    })();
  }, [signer, shouldRefetch]);

  useEffect(() => {
    if (isModalOpen) return refetchUserBalance();

    setTimeout(() => {
      setDepositAmount(undefined);
      setTxHash(undefined);
      setTxLoading(false);
      setError(undefined);
    }, 300);
  }, [isModalOpen]);

  useEffect(() => {
    if (!txLoading) return refetchUserBalance();

    setError(undefined);
    setTxHash(undefined);
  }, [txLoading]);

  const changeDepositAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userBalance) return;

    event.preventDefault();
    const value = event.currentTarget.value;

    if (!RegExp(/^[(\d|.)]*$/).test(value)) return;

    if (value.includes(".")) {
      const decimals = value.split(".")[1];
      if (decimals.length > userBalance.decimals) {
        event.currentTarget.value = depositAmount || "";
        return;
      }
    }

    setDepositAmount(value);
  };

  const onClickDeposit = async () => {
    if (!depositAmount || !userBalance || !signer) return;

    const amount = ethers.parseUnits(depositAmount, userBalance.decimals);
    setTxHash(undefined);
    setError(undefined);

    try {
      setTxLoading(true);
      const tx = await deposit(vault, amount, signer);
      setTxHash(tx);
    } catch (err: any) {
      setError(err);
    } finally {
      setTxLoading(false);
    }
  };

  const isDepositNegative = depositAmount ? +depositAmount < 0 : false;
  const isDepositGreaterThanBalance =
    depositAmount && userBalance
      ? +depositAmount > +userBalance.formatted
      : false;

  const shouldDisableButton =
    !depositAmount ||
    !signer ||
    !userBalance ||
    +userBalance.formatted === 0 ||
    txLoading ||
    isDepositNegative ||
    isDepositGreaterThanBalance;

  const scanner = useScannerUrl();

  return (
    <BaseModal isOpen={isModalOpen} onClose={closeModal} isLarge={!!txHash}>
      {!userBalance ? (
        <div className="p-10">
          <Loader />
        </div>
      ) : txHash ? (
        <Web3SuccessHandler
          hash={txHash}
          message="Your deposit has been placed, click here to view the transaction"
        />
      ) : error ? (
        <Web3ErrorHandler error={error} />
      ) : (
        <div className="p-6">
          <h2 className="font-basement text-[32px] tracking-wider">DEPOSIT</h2>

          <div className="mt-8 flex w-full flex-col items-center">
            <div className="grid w-full grid-cols-2 grid-rows-3">
              <h3 className="text-left text-hl-secondary">Name:</h3>
              <p className="text-left text-hl-tertiary">{vault.name}</p>
              <h3 className="text-left text-hl-secondary">Address:</h3>
              <p className="text-left text-hl-tertiary">
                <a
                  href={`${scanner}/address/${vault.address}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {formatting.shortenAddress(vault.address)}
                </a>
              </p>
              <h3 className="text-left text-hl-secondary">Available:</h3>
              <p className="text-left text-hl-tertiary">
                {userBalance.formatted}
              </p>
              <div className="flex items-center">
                <h3 className="text-left text-hl-secondary">Deposit amount:</h3>
              </div>
              <input
                placeholder="0"
                value={depositAmount}
                onChange={changeDepositAmount}
                className="border border-hl-border bg-hl-background p-2 text-hl-primary !outline-none !ring-0"
              />
            </div>
            <div className="mt-8 mb-2 flex w-full flex-col items-center">
              {txLoading ? (
                <Loader />
              ) : (
                <Button
                  text={`Deposit ${vault.asset.symbol}`}
                  onClick={onClickDeposit}
                  disabled={shouldDisableButton}
                  active={!shouldDisableButton}
                  big
                  white
                />
              )}
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
};
