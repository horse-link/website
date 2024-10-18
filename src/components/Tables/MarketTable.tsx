import React from "react";
import { useConfig } from "../../providers/Config";
import classNames from "classnames";
import utils from "../../utils";
import { ethers } from "ethers";
import { useScannerUrl } from "../../hooks/useScannerUrl";
import { Loader } from "../Loader";
import { formatting } from "horselink-sdk";
import { MarketSummaryTable } from "./MarketSummaryTable";

export const MarketTable: React.FC = () => {
  const config = useConfig();
  const scanner = useScannerUrl();

  const headers = [
    "Name",
    "Total Wagered",
    "Market Address",
    "Vault Address"
  ].map((text, i) => (
    <div
      key={`markettable-${text}-${i}`}
      className={classNames("py-4 text-left font-semibold text-hl-primary", {
        "!text-hl-secondary": i === 1
      })}
    >
      {text}
    </div>
  ));

  const rows = config
    ? config.markets.map((market, i) => {
        const vault = utils.config.getVault(market.vaultAddress, config);
        if (!vault)
          throw new Error(`Could not find vault for market ${market.address}`);

        const style = "w-full text-left py-4";

        const totalInPlay = `${formatting.formatToFourDecimals(
          ethers.formatUnits(market.totalInPlay, vault.asset.decimals)
        )} ${vault.asset.symbol}`;

        const data = [vault.name, totalInPlay];

        return [
          ...data.map((text, i) => (
            <div
              key={`markettable-rows-${text}-${i}`}
              className={classNames(style, {
                "!text-hl-secondary": i === 1
              })}
            >
              {text}
            </div>
          )),
          <div
            className="flex h-full w-full items-center truncate"
            key={`markettable-${market.address}-${i}`}
          >
            <a
              href={`${scanner}/address/${market.address}`}
              target="_blank"
              rel="noreferrer noopener"
              className={classNames(
                style,
                "max-w-[20ch] truncate xl:max-w-[35ch]"
              )}
            >
              {market.address}
            </a>
          </div>,
          <div
            className="flex h-full w-full items-center truncate"
            key={`markettable-${market.vaultAddress}-${i}`}
          >
            <a
              href={`${scanner}/address/${market.vaultAddress}`}
              target="_blank"
              rel="noreferrer noopener"
              className={classNames(
                style,
                "max-w-[20ch] truncate xl:max-w-[35ch]"
              )}
            >
              {market.vaultAddress}
            </a>
          </div>
        ];
      })
    : [];

  return (
    <React.Fragment>
      {/* non-mobile */}
      <div className="hidden lg:block">
        <MarketSummaryTable
          headers={headers}
          headerStyles="font-basement tracking-wider"
          rows={rows}
        />
      </div>

      {/* mobile */}
      <div className="block lg:hidden">
        {!config ? (
          <div className="flex w-full justify-center py-10">
            <Loader />
          </div>
        ) : (
          <div className="flex w-full flex-col items-center">
            {config.markets.map(market => {
              const vault = utils.config.getVault(market.vaultAddress, config);
              if (!vault)
                throw new Error(
                  `Could not find vault for market ${market.address}`
                );

              const totalInPlay = `${formatting.formatToFourDecimals(
                ethers.formatUnits(market.totalInPlay, vault.asset.decimals)
              )} ${vault.asset.symbol}`;

              return (
                <div
                  key={market.address}
                  className="flex w-full flex-col items-center gap-y-2 border-t border-hl-border py-2 text-center"
                >
                  <h2 className="font-basement tracking-wider text-hl-secondary">
                    {vault.name}
                  </h2>
                  <p>{totalInPlay}</p>
                  <a
                    href={`${scanner}/address/${market.address}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-full max-w-full truncate"
                  >
                    Market: {market.address}
                  </a>
                  <a
                    href={`${scanner}/address/${market.vaultAddress}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-full max-w-full truncate"
                  >
                    Vault: {market.vaultAddress}
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
