import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import { getVaultNameFromMarket } from "../../utils/config";
import { useConfig } from "../../providers/Config";
import { BetHistory } from "../../types";
import Loader from "../Loader";
import Modal from "../Modal";
import { ethers } from "ethers";
import useMarketContract from "../../hooks/market/useMarketContract";
import { Web3ErrorHandler, Web3SuccessHandler } from "../Web3Handlers";
import { useSigner } from "wagmi";

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedBet?: BetHistory;
  refetch: () => void;
};

const SettleBetModal: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  selectedBet,
  refetch
}) => {
  const [txLoading, setTxLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [error, setError] = useState<ethers.errors>();

  const { data: signer } = useSigner();
  const config = useConfig();
  const { settleBet } = useMarketContract();

  const market = useMemo(() => 
    config?.markets.find(
      m => m.address.toLowerCase() === selectedBet?.marketAddress.toLowerCase()
    ), 
    [config, selectedBet]
  );

  useEffect(() => {
    if (isModalOpen) return;

    setTimeout(() => {
      setTxHash(undefined);
      setTxLoading(false);
      setError(undefined);
    }, 300);
  }, [isModalOpen]);

  const onClickSettleBet = async () => {
    if (!selectedBet || !market || !signer || !selectedBet.marketOracleResultSig) return;

    try {
      setTxLoading(true);
      const tx = await settleBet(market, selectedBet, signer); // selectedBet.marketOracleResultSig -- re-add when marketOracle accepts ecdsa sigs
      setTxHash(tx);
    } catch (err: any) {
      setError(err.code as ethers.errors);
    } finally {
      setTxLoading(false);
      refetch();
    }
  };

  const token =
    config?.tokens.find(
      t => t.address.toLowerCase() === selectedBet?.assetAddress.toLowerCase()
    );

  const isWinning =
    selectedBet &&
    selectedBet.winningPropositionId &&
    selectedBet.marketResultAdded
      ? selectedBet.winningPropositionId.toLowerCase() ===
        selectedBet.propositionId.toLowerCase()
      : false;

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      {!selectedBet || !config ? (
        <div className="p-10">
          <Loader />
        </div>
      ) : (
        <React.Fragment>
          <h2 className="font-bold text-2xl mr-[8vw] mb-6">
            {selectedBet.settled || txHash ? "Settled" : "Unsettled"} Bet
          </h2>
          <div className="flex flex-col">
            <h3 className="font-semibold mb-2">
              Placed:{" "}
              <span className="font-normal">
                {moment(selectedBet.blockNumber).format("dddd Do MMMM")}
              </span>
            </h3>
            <h3 className="font-semibold mb-2">
              Market:{" "}
              <span className="font-normal">
                {getVaultNameFromMarket(
                  market!.address,
                  config
                )}
              </span>
            </h3>
            <h3 className="font-semibold mb-2">
              Amount:{" "}
              <span className="font-normal">
                {ethers.utils.formatEther(selectedBet.amount)} {token?.symbol}
              </span>
            </h3>
            <h3 className="font-semibold">
              Winning:{" "}
              {selectedBet.marketResultAdded ? (
                <span className="font-normal">{isWinning.toString()}</span>
              ) : (
                <span className="font-normal">
                  Market results haven&apos;t been added yet
                </span>
              )}
            </h3>
            <button
              className="w-full font-bold border-black border-2 py-2 rounded-md relative top-6 hover:text-white hover:bg-black transition-colors duration-100 disabled:text-black/50 disabled:border-black/50 disabled:bg-white"
              onClick={onClickSettleBet}
              disabled={
                !signer ||
                selectedBet.settled ||
                !selectedBet.marketOracleResultSig ||
                txLoading || 
                !!txHash
              }
            >
              {txLoading ? <Loader /> : "SETTLE BET"}
            </button>
            <br />
            {txHash && <Web3SuccessHandler hash={txHash} />}
            {error && <Web3ErrorHandler error={error} />}
          </div>
        </React.Fragment>
      )}
    </Modal>
  );
};

export default SettleBetModal;
