import React from "react";
import { usePromise } from "../../hooks/usePromise";
import { useApi } from "../../providers/Api";
import { HistorySummaryTable } from "./HistorySummaryTable";
import classNames from "classnames";
import { useScannerUrl } from "../../hooks/useScannerUrl";
import { ethers } from "ethers";
import dayjs from "dayjs";
import { Loader } from "../Loader";
import { formatting } from "horselink-sdk";

export const MarketHistoryTable: React.FC = () => {
  const api = useApi();
  const history = usePromise(api.getMarketHistory)?.sort((a, b) => {
    if (a.createdAt > b.createdAt) {
      return -1;
    }
    if (a.createdAt < b.createdAt) {
      return 1;
    }
    return 0;
  });

  const scanner = useScannerUrl();

  const headers = ["TxID", "Vault Address", "Amount", "Time", "Type"].map(
    (text, i) => (
      <div
        key={`markethistorytable-${text}-${i}`}
        className={classNames(
          "w-full py-4 text-left font-semibold text-hl-primary",
          {
            "!text-hl-secondary": [1, 4].includes(i)
          }
        )}
      >
        {text}
      </div>
    )
  );

  const rows = history
    ? history.map((h, i) => {
        const style = "w-full text-left py-4";

        return [
          <div
            key={`markethistorytable-${h.id}-${i}`}
            className="flex h-full w-full items-center truncate"
          >
            <a
              href={`${scanner}/tx/${h.id}`}
              target="_blank"
              rel="noreferrer noopener"
              className={classNames(
                style,
                "max-w-[20ch] truncate xl:max-w-[45ch]"
              )}
            >
              {h.id}
            </a>
          </div>,
          <div
            key={`markethistorytable-${h.vaultAddress}-${i}`}
            className="flex h-full w-full items-center truncate"
          >
            <a
              href={`${scanner}/address/${h.vaultAddress}`}
              target="_blank"
              rel="noreferrer noopener"
              className={classNames(
                style,
                "max-w-[20ch] truncate text-hl-secondary xl:max-w-[45ch]"
              )}
            >
              {h.vaultAddress}
            </a>
          </div>,
          <div
            key={`markethistorytable-${h.amount.toString()}-${i}`}
            className="w-full py-4 text-left"
          >
            {formatting.formatToFourDecimals(ethers.formatEther(h.amount))}
          </div>,
          <div
            key={`markethistorytable-${h.createdAt}-${i}`}
            className="w-full py-4 text-left"
          >
            {dayjs.unix(h.createdAt).fromNow()}
          </div>,
          <div
            key={`markethistorytable-${h.type}-${i}`}
            className="w-full py-4 text-left text-hl-secondary"
          >
            {h.type}
          </div>
        ];
      })
    : [];

  const loading = [
    [
      <div key="markethistorytable-loading-blank" />,
      <div className="py-4" key="markethistorytable-loading-message">
        Loading...
      </div>
    ]
  ];

  const noEntities = [
    [
      <div key="markethistorytable-noentities-blank" />,
      <div className="py-4" key="markethistorytable-noentities-message">
        No entities!
      </div>
    ]
  ];

  return (
    <React.Fragment>
      {/* non-mobile */}
      <div className="hidden lg:block">
        <HistorySummaryTable
          headers={headers}
          headerStyles="font-basement tracking-wider"
          rows={!history ? loading : !history.length ? noEntities : rows}
        />
      </div>

      {/* mobile */}
      <div className="block lg:hidden">
        {!history?.length ? (
          <div className="flex w-full justify-center py-10">
            <Loader />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            {history.map(h => (
              <div
                key={h.id}
                className="flex w-full flex-col items-center gap-y-2 border-t border-hl-border py-2 text-center"
              >
                <h2 className="font-basement tracking-wider text-hl-secondary">
                  {h.type}
                </h2>
                <p>
                  {formatting.formatToFourDecimals(
                    ethers.formatEther(h.amount)
                  )}
                </p>
                <a
                  href={`${scanner}/tx/${h.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full max-w-full truncate"
                >
                  TxId: {h.id}
                </a>
                <a
                  href={`${scanner}/address/${h.vaultAddress}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="w-full max-w-full truncate"
                >
                  Vault: {h.vaultAddress}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
