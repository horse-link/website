import React from "react";
import { FaucetBalance } from "../../types/faucet";
import { useAccount } from "wagmi";
import { useApi } from "../../providers/Api";
import { useConfig } from "../../providers/Config";
import { useWalletModal } from "../../providers/WalletModal";
import classNames from "classnames";
import { Table } from "./Table";
import { ethers } from "ethers";
import { useScannerUrl } from "../../hooks/useScannerUrl";
import { Button } from "../Buttons";
import { formatting } from "horselink-sdk";

type Props = {
  balances?: Array<FaucetBalance>;
  setHash: (hash?: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
};

export const FaucetTable: React.FC<Props> = ({
  balances,
  setHash,
  setIsModalOpen
}) => {
  const config = useConfig();
  const { address } = useAccount();
  const { openWalletModal } = useWalletModal();
  const api = useApi();
  const scanner = useScannerUrl();

  const claim = async (tokenAddress: string) => {
    if (!address) return openWalletModal();

    setHash(undefined);

    try {
      const res = await api.requestTokenFromFaucet(address, tokenAddress);
      setHash(res.tx);
      setIsModalOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const headers = ["Name", "Symbol", "Amount", "Address", "Claim"].map(
    (text, i) => (
      <div
        key={`markettable-${text}-${i}`}
        className={classNames(
          "w-full py-4 text-left font-semibold text-hl-primary",
          {
            "!text-hl-secondary": i === 3
          }
        )}
      >
        {text}
      </div>
    )
  );

  const rows =
    config && balances
      ? config.tokens.map((token, i) => {
          const style = "w-full text-left py-4";

          const tokenBalance = balances.find(
            amount => amount.symbol.toLowerCase() === token.symbol.toLowerCase()
          );

          const amount = `${formatting.formatToFourDecimals(
            ethers.formatUnits(
              tokenBalance?.amount || 0n,
              tokenBalance?.decimals
            )
          )} ${token.symbol}`;

          const data = [token.name, token.symbol, amount];

          return [
            ...data.map((text, i) => (
              <div
                key={`faucettable-rows-${text}-${i}`}
                className={classNames(style)}
              >
                {text}
              </div>
            )),
            <div
              className="flex h-full w-full items-center truncate"
              key={`faucettable-${token.address}-${i}`}
            >
              <a
                href={`${scanner}/address/${token.address}`}
                target="_blank"
                rel="noreferrer noopener"
                className={classNames(
                  style,
                  "max-w-[10ch] truncate text-hl-secondary xl:max-w-[20ch]"
                )}
              >
                {token.address}
              </a>
            </div>,
            <div
              className="flex h-full w-full items-center truncate"
              key={`faucettable-${token.address}-${i}`}
            >
              <Button
                text={token.name}
                onClick={() => claim(token.address)}
                big
              />
            </div>
          ];
        })
      : [];

  const loading = [
    [
      <div key="faucettable-loading-blank" />,
      <div className="py-4" key="faucettable-loading-message">
        Loading...
      </div>
    ]
  ];

  return (
    <Table
      headers={headers}
      headerStyles="font-basement tracking-wider"
      rows={!config || !balances ? loading : rows}
    />
  );
};
