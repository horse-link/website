import React, { useState, useEffect } from "react";
import { useBetSlipContext } from "../providers/BetSlip";
import { BigNumber, ethers } from "ethers";
import utils from "../utils";
import { useConfig } from "../providers/Config";
import { useMarketContract } from "../hooks/contracts";
import { useNetwork, useSigner } from "wagmi";
import { BetTotals } from "../types/bets";
import { useApolloWithForce } from "../providers/Apollo";
import { useApiWithForce } from "../providers/Api";
import { Card } from "./Card";
import { VscTrash } from "react-icons/vsc";
import { Button } from "./Buttons";
import { Loader } from "./Loader";
import { formatting } from "horselink-sdk";

export const BetSlip: React.FC = () => {
  const config = useConfig();
  const { data: signer } = useSigner();
  const { bets, removeBet, forceNewSigner, placeBetsInBetSlip, txLoading } =
    useBetSlipContext();
  const { getPotentialPayout } = useMarketContract();
  const [slipTotals, setSlipTotals] = useState<BetTotals>();

  const { chain: currentChain } = useNetwork();
  const { chain: apolloChain, forceNewChain: forceApolloChain } =
    useApolloWithForce();
  const { chain: apiChain, forceNewChain: forceApiChain } = useApiWithForce();

  // chain check logic
  useEffect(() => {
    if (!currentChain || !apolloChain || !apiChain) return;

    if (currentChain.id !== apolloChain.id || currentChain.id !== apiChain.id) {
      forceApiChain(currentChain);
      forceApolloChain(currentChain);
    }
  }, [currentChain, apolloChain, apiChain]);

  useEffect(() => {
    if (!signer) return;

    forceNewSigner(signer);
  }, [signer]);

  useEffect(() => {
    if (!bets || !signer) return;

    (async () => {
      const betTotals = await Promise.all(
        bets.map(async bet => {
          const payout = await getPotentialPayout(
            bet.market,
            BigNumber.from(bet.wager),
            bet.back,
            signer
          );

          return {
            market: bet.market,
            payout,
            stake: BigNumber.from(bet.wager)
          };
        })
      );

      const totalsPerAsset = betTotals.reduce(
        (previousPayout, currentPayout) => {
          const vault = utils.config.getVaultFromMarket(
            currentPayout.market,
            config
          );
          if (!vault)
            throw new Error(
              `No vault associated with market, ${currentPayout.market.address}`
            );

          const name = vault.asset.address;
          const payoutUnits = ethers.formatUnits(
            currentPayout.payout,
            vault.asset.decimals
          );
          const parsedPayoutUnits = ethers.parseEther(payoutUnits);

          const stakeUnits = ethers.formatUnits(
            currentPayout.stake,
            vault.asset.decimals
          );
          const parsedStakedUnits = ethers.parseEther(stakeUnits);

          return {
            ...previousPayout,
            [name]: {
              payout: previousPayout[name]
                ? previousPayout[name].payout.add(parsedPayoutUnits)
                : parsedPayoutUnits,
              symbol: vault.asset.symbol,
              stake: previousPayout[name]
                ? previousPayout[name].stake.add(parsedStakedUnits)
                : parsedStakedUnits
            }
          };
        },
        {} as NonNullable<typeof slipTotals>
      );

      setSlipTotals(totalsPerAsset);
    })();
  }, [bets, config, signer]);

  return (
    <Card
      title="Bet Slip"
      data={
        <div className="w-full font-sans text-base font-normal">
          {!bets?.length || !config ? (
            <div className="w-full text-center">No bets!</div>
          ) : (
            bets.map((bet, i) => {
              const vault = utils.config.getVaultFromMarket(bet.market, config);

              return (
                <div
                  className="flex w-full flex-col items-center border-b border-hl-border px-3 py-2 3xl:flex-row"
                  key={`bet-${bet.id}`}
                >
                  <div className="flex w-full items-center gap-x-6">
                    <div className="hidden bg-hl-primary px-3 py-1 text-xl font-bold text-hl-secondary 3xl:block">
                      {i + 1}
                    </div>
                    <div className="flex w-full flex-col items-center 3xl:block">
                      <p className="text-center font-basement font-black 3xl:text-left">
                        {bet.runner.name}
                      </p>
                      <p className="text-hl-tertiary">
                        {formatting.formatToFourDecimals(
                          ethers.formatUnits(bet.wager, vault?.asset.decimals)
                        )}{" "}
                        {vault?.asset.symbol || "Token"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex w-full flex-col items-center gap-x-4 gap-y-2 3xl:mt-0 3xl:flex-row 3xl:justify-end 3xl:gap-y-0">
                    <div className="w-full text-center 3xl:text-right">
                      <p>
                        {bet.name} {bet.number}
                      </p>
                      <p className="text-hl-secondary">
                        {formatting.formatToTwoDecimals(
                          bet.back.odds.toString()
                        )}{" "}
                        Win
                      </p>
                    </div>
                    <VscTrash
                      onClick={() => removeBet(bet.id)}
                      color="white"
                      className="cursor-pointer"
                      size={40}
                    />
                  </div>
                </div>
              );
            })
          )}
          <div className="mt-10">
            {bets && slipTotals && (
              <React.Fragment>
                <div className="flex items-start justify-between pb-4">
                  <span className="font-basement font-bold">
                    POTENTIAL PAYOUT:{" "}
                  </span>
                  <div className="text-hl-secondary">
                    {Object.entries(slipTotals).map(([symbol, details]) => (
                      <span className="block text-right" key={symbol}>
                        {formatting.formatToFourDecimals(
                          ethers.formatEther(details.payout)
                        )}
                        {` ${details.symbol}`}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-basement font-bold">TOTAL STAKE: </span>
                  <div className="text-hl-secondary">
                    {Object.entries(slipTotals).map(([symbol, details]) => (
                      <span className="block text-right" key={symbol}>
                        {formatting.formatToFourDecimals(
                          ethers.formatEther(details.stake)
                        )}
                        {` ${details.symbol}`}
                      </span>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
          <div className="mt-6 font-bold">
            {bets?.length &&
              (txLoading ? (
                <div className="flex w-full justify-center">
                  <Loader />
                </div>
              ) : (
                <Button big text="Bet Now" onClick={placeBetsInBetSlip} />
              ))}
          </div>
        </div>
      }
    />
  );
};
