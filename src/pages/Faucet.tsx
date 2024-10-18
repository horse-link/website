import { ethers } from "ethers";
import { AddressLink, Card, PageLayout } from "../components";
import React, { useEffect, useState } from "react";
import { FaucetBalance } from "../types/faucet";
import { useConfig } from "../providers/Config";
import { ERC20__factory } from "../typechain";
import { useBalance, useProvider } from "wagmi";
import { FaucetModal } from "../components/Modals";
import { FaucetTable } from "../components/Tables";
import { formatting } from "horselink-sdk";

const FAUCET_ADDRESS = "0xf919eaf2e37aac718aa19668b9071ee42c02c081";

const Faucet: React.FC = () => {
  const config = useConfig();
  const provider = useProvider();
  const { data: ethBalance } = useBalance({
    address: FAUCET_ADDRESS
  });
  const [balances, setBalances] = useState<Array<FaucetBalance>>();
  const [hash, setHash] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // fetch balances
  useEffect(() => {
    if (!config || !ethBalance) return;

    Promise.all(
      config.tokens.map(async t => {
        const contract = ERC20__factory.connect(t.address, provider);
        const [balance, decimals, symbol] = await Promise.all([
          contract.balanceOf(FAUCET_ADDRESS),
          contract.decimals(),
          contract.symbol()
        ]);

        return {
          name: t.name,
          amount: balance,
          symbol,
          decimals
        };
      })
    )
      .then(b => {
        const newBalances = [
          {
            name: "ETH",
            symbol: "ETH",
            amount: ethBalance.value,
            decimals: ethBalance.decimals
          },
          ...b
        ];

        setBalances(newBalances);
      })
      .catch(console.error);
  }, [config, provider, ethBalance]);

  const closeModal = () => setIsModalOpen(false);

  return (
    <PageLayout>
      {balances ? (
        <div className="mb-4 grid w-full gap-x-1 gap-y-2 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-4">
          {balances.map(b => (
            <Card
              key={b.name}
              title={b.name}
              data={`${formatting.formatToFourDecimals(
                ethers.formatUnits(b.amount, b.decimals)
              )} ${b.symbol}`}
            />
          ))}
        </div>
      ) : (
        <div className="mb-4 w-full">
          <Card title="Loading faucet balances..." />
        </div>
      )}
      <div className="w-full border border-hl-border p-6 text-hl-primary">
        <h2 className="mb-3">
          Claim tokens on the Sepolia Testnet and start punting!
        </h2>
        <p className="my-2 text-xs">
          You can find the faucet at{" "}
          {<AddressLink address={FAUCET_ADDRESS} className="underline" />}. This
          page is used for testing the beta functionality of the web app, and
          does not have any bearing on real world earnings, winnings, and/or
          losses; it is purely for testing.
        </p>
      </div>
      <div className="mt-4 w-full">
        <FaucetTable
          balances={balances}
          setHash={setHash}
          setIsModalOpen={setIsModalOpen}
        />
      </div>
      <FaucetModal isOpen={isModalOpen} onClose={closeModal} txHash={hash} />
    </PageLayout>
  );
};

export default Faucet;
