import React from "react";
import { BetHistoryResponse2, BetStatus } from "../../types/bets";
import { Config } from "../../types/config";
import { useAccount } from "wagmi";
import { useWalletModal } from "../../providers/WalletModal";
import { Table } from "./Table";
import classNames from "classnames";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Loader } from "../Loader";
import { useScannerUrl } from "../../hooks/useScannerUrl";
import { ethers } from "ethers";
import { formatting } from "horselink-sdk";

dayjs.extend(relativeTime);

type Props = {
  allBetsEnabled: boolean;
  paramsAddressExists: boolean;
  betHistory?: Array<BetHistoryResponse2>;
  config?: Config;
  setSelectedBet: (bet?: BetHistoryResponse2) => void;
  setIsModalOpen: (isOpen: boolean) => void;
};

export const BetTable: React.FC<Props> = ({
  allBetsEnabled,
  paramsAddressExists,
  betHistory,
  config,
  setSelectedBet,
  setIsModalOpen
}) => {
  const { isConnected } = useAccount();
  const { openWalletModal } = useWalletModal();
  const scanner = useScannerUrl();

  const onClickBet = (bet?: BetHistoryResponse2) => {
    if (!bet) return;
    if (!isConnected) return openWalletModal();

    setSelectedBet(bet);
    setIsModalOpen(true);
  };

  const headers = [
    "#",
    "Punter",
    "Wager",
    "Payout",
    "Time",
    "Race",
    "Proposition",
    "Result",
    "Status"
  ].map((text, i) => (
    <div
      key={`racetable-${text}-${i}`}
      className={classNames(
        "w-full py-4 text-left text-xs font-semibold text-hl-primary xl:text-base",
        {
          "!text-hl-secondary": [1, 5].includes(i)
        }
      )}
    >
      {text}
    </div>
  ));

  const rows =
    betHistory && config
      ? betHistory.map((bet, i) => {
          const style =
            "w-full text-left py-4 text-hl-tertiary text-xs xl:text-base";

          const betClosed = (
            ["SETTLED", "REFUNDED"] as Array<BetStatus>
          ).includes(bet.status);

          // const betDidWin = betClosed ? bet.result === "WIN" : undefined;

          return [
            <div
              key={`racetable-bet-${bet.index}-${i}-index`}
              className={classNames(style, "font-basement")}
              onClick={() => onClickBet(bet)}
            >
              {bet.index}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-punter`}
              className={classNames(
                style,
                "max-w-[10ch] truncate !text-hl-secondary xl:max-w-[20ch]"
              )}
              onClick={() => onClickBet(bet)}
            >
              {bet.punter}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-formattedWager`}
              className={style}
              onClick={() => onClickBet(bet)}
            >
              {formatting.formatToFourDecimals(ethers.formatEther(bet.amount))}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-payout`}
              className={style}
              onClick={() => onClickBet(bet)}
            >
              {bet.result === "LOSE"
                ? "0"
                : formatting.formatToFourDecimals(
                    ethers.formatEther(bet.payout)
                  )}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-blockNumber`}
              className={style}
              onClick={() => onClickBet(bet)}
            >
              {dayjs.unix(bet.time).fromNow()}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-date`}
              className={classNames(style, "!text-hl-secondary")}
              onClick={() => onClickBet(bet)}
            >
              {bet.race}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-propositionId`}
              className={style}
              onClick={() => onClickBet(bet)}
            >
              {bet.proposition}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-result`}
              className={style}
              onClick={() => onClickBet(bet)}
            >
              {betClosed ? bet.result : "PENDING"}
            </div>,
            <div
              key={`racetable-bet-${bet.index}-${i}-status`}
              className={style}
              onClick={() => onClickBet(bet)}
            >
              {bet.status}
            </div>
          ];
        })
      : [];

  const notAllBetsAndNoParamAddress = [
    [
      <div key="bettable-notall-blank" />,
      <div className="py-4" key="bettable-notall-message">
        Connect your wallet or add an address to the URL
      </div>
    ]
  ];

  const noBets = [
    [
      <div key="bettable-nobets-blank" />,
      <div className="py-4" key="bettable-nobets-message">
        No bets!
      </div>
    ]
  ];

  const loading = [
    [
      <div key="bettable-loading-blank" />,
      <div className="py-4" key="bettable-loading-message">
        Loading...
      </div>
    ]
  ];

  return (
    <React.Fragment>
      {/* non-mobile */}
      <div className="hidden lg:block">
        <Table
          headers={headers}
          headerStyles="font-basement tracking-wider"
          rows={
            !allBetsEnabled && !paramsAddressExists
              ? notAllBetsAndNoParamAddress
              : !betHistory || !config
              ? loading
              : !betHistory.length
              ? noBets
              : rows
          }
          rowStyles={classNames({
            "hover:bg-hl-primary cursor-pointer hover:!text-hl-secondary":
              !closed
          })}
        />
      </div>

      {/* mobile */}
      <div className="block lg:hidden">
        {!allBetsEnabled && !paramsAddressExists ? (
          <div className="flex w-full flex-col items-center gap-y-2 border-t border-hl-border py-2 text-center">
            Connect your wallet or add an address to the URL
          </div>
        ) : !betHistory || !config ? (
          <div className="flex w-full justify-center py-10">
            <Loader />
          </div>
        ) : !betHistory.length ? (
          <div className="flex w-full flex-col items-center gap-y-2 border-t border-hl-border py-2 text-center">
            No bets!
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            {betHistory.map(bet => {
              const betClosed = (
                ["SETTLED", "REFUNDED"] as Array<BetStatus>
              ).includes(bet.status);

              const betDidWin = betClosed ? bet.result === "WIN" : undefined;

              return (
                <div
                  key={JSON.stringify(bet)}
                  className="flex w-full flex-col items-center gap-y-2 border-t border-hl-border py-2 text-center"
                  onClick={() => onClickBet(bet)}
                >
                  <h2 className="font-basement tracking-wider text-hl-secondary">
                    {bet.index} {bet.status} {betClosed ? bet.result : ""}
                  </h2>
                  <p>{bet.race}</p>
                  <p>{bet.proposition}</p>
                  <p className="text-hl-secondary">
                    {formatting.formatToFourDecimals(
                      ethers.formatEther(
                        betDidWin === true ? bet.payout : bet.amount
                      )
                    )}
                  </p>
                  <a
                    href={`${scanner}/address/${bet.punter}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-full max-w-full truncate"
                  >
                    Punter: {bet.punter}
                  </a>
                  <a
                    href={`${scanner}/tx/${bet.tx}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-full max-w-full truncate"
                  >
                    TxID: {bet.tx}
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
