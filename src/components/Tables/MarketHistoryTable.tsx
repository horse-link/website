import React from "react";
import { usePromise } from "../../hooks/usePromise";
import { useApi } from "../../providers/Api";
import { NewTable } from "./NewTable";
import classNames from "classnames";
import { useScannerUrl } from "../../hooks/useScannerUrl";
import utils from "../../utils";
import { ethers } from "ethers";
import dayjs from "dayjs";
import { Loader } from "../Loader";

export const MarketHistoryTable: React.FC = () => {
  const api = useApi();
  const history = usePromise(api.getMarketHistory);
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
            className="flex h-full w-full items-center truncate"
            key={`markethistorytable-${h.id}-${i}`}
          >
            <a
              href={`${scanner}/tx/${h.id}`}
              target="_blank"
              rel="noreferrer noopener"
              className={classNames(
                style,
                "max-w-[10ch] truncate xl:max-w-[20ch]"
              )}
            >
              {h.id}
            </a>
          </div>,
          <div
            className="flex h-full w-full items-center truncate"
            key={`markethistorytable-${h.vaultAddress}-${i}`}
          >
            <a
              href={`${scanner}/address/${h.vaultAddress}`}
              target="_blank"
              rel="noreferrer noopener"
              className={classNames(
                style,
                "max-w-[10ch] truncate xl:max-w-[20ch]"
              )}
            >
              {h.vaultAddress}
            </a>
          </div>,
          <div
            className="w-full py-4 text-left"
            key={`markethistorytable-${h.amount.toString()}-${i}`}
          >
            {utils.formatting.formatToFourDecimals(
              ethers.utils.formatEther(h.amount)
            )}
          </div>,
          <div
            key={`markethistorytable-${h.createdAt}-${i}`}
            className="w-full py-4 text-left"
          >
            {dayjs.unix(h.createdAt).fromNow()}
          </div>,
          <div
            className="w-full py-4 text-left"
            key={`markethistorytable-${h.type}-${i}`}
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
      <div key="markethistorytable-nobets-blank" />,
      <div className="py-4" key="markethistorytable-nobets-message">
        No entities!
      </div>
    ]
  ];

  return (
    <React.Fragment>
      {/* non-mobile */}
      <div className="hidden lg:block">
        <NewTable
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
              <div></div>
            ))}
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
