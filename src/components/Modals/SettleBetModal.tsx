import React, { useEffect, useRef, useState } from "react";
import { Loader } from "../";
import { BaseModal } from ".";
import { ethers } from "ethers";
import { useMarketContract } from "../../hooks/contracts";
import { Web3ErrorHandler, Web3SuccessHandler } from "../Web3Handlers";
import { useSigner } from "wagmi";
import utils from "../../utils";
import {
  BetHistoryResponse2,
  SignedBetHistoryResponse2
} from "../../types/bets";
import { Config } from "../../types/config";
import { useApi } from "../../providers/Api";
import { useScannerUrl } from "../../hooks/useScannerUrl";
import { Button } from "../Buttons";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { formatting } from "horselink-sdk";
import { ErrorCode } from "ethers";

dayjs.extend(advancedFormat);

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedBet?: BetHistoryResponse2;
  config?: Config;
};

export const SettleBetModal: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  selectedBet,
  config
}) => {
  const [txLoading, setTxLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<ErrorCode>();

  const [bet, setBet] = useState<SignedBetHistoryResponse2>();

  const { data: signer } = useSigner();
  const { settleBet, refundBet } = useMarketContract();

  const { current: now } = useRef(Math.floor(Date.now() / 1000));

  const api = useApi();
  const scanner = useScannerUrl();

  // get signed bet
  useEffect(() => {
    if (!selectedBet || !isModalOpen) return;

    api
      .getWinningResultSignature(
        utils.markets.getMarketIdFromPropositionId(selectedBet.propositionId),
        // we want to sign if the bet isnt already settled
        selectedBet.status !== "SETTLED"
      )
      .then(signedData =>
        setBet({
          ...selectedBet,
          ...signedData,
          scratched: signedData.scratchedRunners?.find(
            runner =>
              runner.b16propositionId.toLowerCase() ===
              formatting
                .formatBytes16String(selectedBet.propositionId)
                .toLowerCase()
          )
        })
      )
      .catch(console.error);
  }, [selectedBet, isModalOpen]);

  // clean up
  useEffect(() => {
    if (isModalOpen) return;

    setTimeout(() => {
      setTxHash(undefined);
      setTxLoading(false);
      setError(undefined);
      setBet(undefined);
    }, 300);
  }, [isModalOpen]);

  const token = config?.tokens.find(
    t => t.address.toLowerCase() === bet?.asset.toLowerCase()
  );

  const vault = config?.vaults.find(
    v => v.asset.address.toLowerCase() === token?.address.toLowerCase()
  );

  const market = config?.markets.find(
    m => m.vaultAddress.toLowerCase() === vault?.address.toLowerCase()
  );

  const isScratched = bet?.status === "SCRATCHED";

  const isPastPayoutDate = now > (bet?.time || 0);

  const isSettled = bet?.status === "SETTLED";

  const onClickSettleBet = async () => {
    if (!bet || !market || !signer || !config) return;
    setTxHash(undefined);
    setError(undefined);

    try {
      setTxLoading(true);
      let tx: string;
      if (isScratched) {
        tx = await refundBet(market, bet, signer);
      } else {
        tx = await settleBet(market, bet, signer, config);
      }
      setTxHash(tx);
    } catch (err: any) {
      setError(err);
    } finally {
      setTxLoading(false);
    }
  };

  const settleButtonDisabled =
    !signer ||
    isSettled ||
    bet?.status === "PENDING" ||
    !isPastPayoutDate ||
    txLoading ||
    !!txHash;

  return (
    <BaseModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      isLarge={!!txHash}
    >
      {!bet || !config || !market || !token ? (
        <div className="p-10">
          <Loader />
        </div>
      ) : isSettled ? (
        <div className="p-4">
          <h2 className="font-basement text-[32px] tracking-wider">
            {formatting.formatFirstLetterCapitalised(bet.status)} Bet #
            {bet.index}
          </h2>

          <p className="mt-2 font-semibold">
            Tx Hash:{" "}
            <a
              href={`${scanner}/tx/${bet.settledAtTx}`}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-hl-secondary underline"
            >
              {formatting.shortenHash(bet.settledAtTx)}
            </a>
          </p>
        </div>
      ) : txHash ? (
        <Web3SuccessHandler
          hash={txHash}
          message="Your settlement has been placed, click here to view the transaction"
        />
      ) : error ? (
        <Web3ErrorHandler error={error} />
      ) : (
        <div className="p-6">
          <h2 className="font-basement text-[32px] tracking-wider">
            {formatting.formatFirstLetterCapitalised(bet.result)} Bet #
            {bet.index}
          </h2>

          <div className="mt-8 flex w-full flex-col items-center">
            <div className="grid w-full grid-cols-2">
              <h3 className="text-left text-hl-secondary">Placed:</h3>
              <p className="text-left text-hl-tertiary">
                {dayjs.unix(bet.time).format("dddd Do MMMM")}
              </p>
              <h3 className="text-left text-hl-secondary">Market:</h3>
              <p className="text-left text-hl-tertiary">
                {utils.config.getVaultNameFromMarket(market.address, config)}
              </p>
              {bet.result === "WIN" ? (
                <React.Fragment>
                  <h3 className="text-left text-hl-secondary">Win:</h3>
                  <p className="text-left text-hl-tertiary">
                    {ethers.formatEther(bet.payout)} {token.symbol}
                  </p>
                </React.Fragment>
              ) : bet.result === "LOSE" ? (
                <React.Fragment>
                  <h3 className="text-left text-hl-secondary">
                    {isScratched ? "Refund" : "Loss"}:
                  </h3>
                  <p className="text-left text-hl-tertiary">
                    {ethers.formatEther(bet.amount)} {token.symbol}
                  </p>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <h3 className="text-left text-hl-secondary">Bet:</h3>
                  <p className="text-left text-hl-tertiary">
                    {ethers.formatEther(bet.amount)} {token.symbol}
                  </p>
                  <h3 className="text-left text-hl-secondary">
                    {isScratched ? "Refunded:" : "Potential Payout:"}
                  </h3>
                  <p className="text-left text-hl-tertiary">
                    {formatting.formatToFourDecimals(
                      ethers.formatEther(bet.payout)
                    )}
                  </p>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className="mt-6">
            <Button
              text={txLoading ? "processing..." : "SETTLE BET"}
              onClick={onClickSettleBet}
              active={!settleButtonDisabled}
              disabled={settleButtonDisabled}
              big
            />
            {!bet.marketResultAdded && (
              <p className="my-2 text-xs text-hl-primary">
                Note: will require two transactions to add market results first
              </p>
            )}
          </div>
        </div>
      )}
    </BaseModal>
  );
};
