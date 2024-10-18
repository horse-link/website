import React, { useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { BaseModal } from ".";
import { Loader } from "../";
import { ethers } from "ethers";
import { Web3ErrorHandler, Web3SuccessHandler } from "../Web3Handlers";
import { useVaultContract } from "../../hooks/contracts";
import { Vault__factory } from "../../typechain";
import useRefetch from "../../hooks/useRefetch";
import { UserBalance } from "../../types/users";
import { Button } from "../Buttons";
import { useScannerUrl } from "../../hooks/useScannerUrl";
import { formatting, VaultInfo } from "horselink-sdk";

type Props = {
  isModalOpen: boolean;
  closeModal: () => void;
  vault: VaultInfo;
};

export const WithdrawVaultModal: React.FC<Props> = ({
  isModalOpen,
  closeModal,
  vault
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<string>();
  const [userAssets, setUserAssets] = useState<UserBalance>();
  const [txLoading, setTxLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<ethers.errors>();

  const { address } = useAccount();
  const { data: signer } = useSigner();

  const { withdraw } = useVaultContract();
  const { shouldRefetch, refetch: refetchUserShares } = useRefetch();

  useEffect(() => {
    if (!signer || !address) return;

    setUserAssets(undefined);
    const vaultContract = Vault__factory.connect(vault.address, signer);
    (async () => {
      const [shares, decimals] = await Promise.all([
        vaultContract.balanceOf(address),
        vaultContract.decimals()
      ]);
      const assets = await vaultContract.convertToAssets(shares);
      setUserAssets({
        value: assets,
        decimals,
        formatted: ethers.formatUnits(assets, decimals)
      });
    })();
  }, [signer, address, shouldRefetch]);

  useEffect(() => {
    if (isModalOpen) return refetchUserShares();

    setTimeout(() => {
      setWithdrawAmount(undefined);
      setTxHash(undefined);
      setTxLoading(false);
      setError(undefined);
    }, 300);
  }, [isModalOpen]);

  useEffect(() => {
    if (!txHash) return;

    refetchUserShares();
  }, [txHash]);

  const changeWithdrawAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userAssets) return;

    event.preventDefault();
    const value = event.currentTarget.value;

    if (!RegExp(/^[(\d|.)]*$/).test(value)) return;

    if (value.includes(".")) {
      const decimals = value.split(".")[1];
      if (decimals.length > userAssets.decimals) {
        event.currentTarget.value = withdrawAmount || "";
        return;
      }
    }

    setWithdrawAmount(value);
  };

  const onClickWithdraw = async () => {
    if (!withdrawAmount || !userAssets || !signer) return;

    const amount = ethers.parseUnits(withdrawAmount, userAssets.decimals);
    setTxHash(undefined);
    setError(undefined);

    try {
      setTxLoading(true);
      const tx = await withdraw(vault, amount, signer);
      setTxHash(tx);
    } catch (err: any) {
      setError(err);
    } finally {
      setTxLoading(false);
    }
  };

  const isWithdrawNegative = withdrawAmount ? +withdrawAmount < 0 : false;
  const isWithdrawGreaterThanAssets =
    withdrawAmount && userAssets
      ? +withdrawAmount > +userAssets.formatted
      : false;

  const shouldDisableButton =
    !withdrawAmount ||
    !signer ||
    !userAssets ||
    +userAssets.formatted === 0 ||
    txLoading ||
    isWithdrawNegative ||
    isWithdrawGreaterThanAssets;

  const scanner = useScannerUrl();

  return (
    <BaseModal isOpen={isModalOpen} onClose={closeModal} isLarge={!!txHash}>
      {!userAssets ? (
        <div className="p-10">
          <Loader />
        </div>
      ) : txHash ? (
        <Web3SuccessHandler
          hash={txHash}
          message="Your withdraw has been placed, click here to view the transaction"
        />
      ) : error ? (
        <Web3ErrorHandler error={error} />
      ) : (
        <div className="p-6">
          <h2 className="font-basement text-[32px] tracking-wider">WITHDRAW</h2>

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
                {userAssets.formatted}
              </p>
              <div className="flex items-center">
                <h3 className="text-left text-hl-secondary">
                  Withdraw amount:
                </h3>
              </div>
              <input
                placeholder="0"
                value={withdrawAmount}
                onChange={changeWithdrawAmount}
                className="border border-hl-border bg-hl-background p-2 text-hl-primary !outline-none !ring-0"
              />
            </div>
            <div className="mt-8 mb-2 flex w-full flex-col items-center">
              {txLoading ? (
                <Loader />
              ) : (
                <Button
                  text={`Withdraw ${vault.asset.symbol}`}
                  onClick={onClickWithdraw}
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
