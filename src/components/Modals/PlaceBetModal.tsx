import { ethers } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useConfig } from "../../providers/Config";
import { useSigner } from "wagmi";
import { Loader } from "../";
import { BaseModal } from ".";
import { Config, MarketInfo } from "../../types/config";
import { useMarketContract, useERC20Contract } from "../../hooks/contracts";
import useRefetch from "../../hooks/useRefetch";
import utils from "../../utils";
import { Back, RaceData, Runner } from "../../types/meets";
import { UserBalance } from "../../types/users";
import { useBetSlipContext } from "../../providers/BetSlip";
import { useParams } from "react-router-dom";

type Props = {
  runner?: Runner;
  race?: RaceData;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
};

export const PlaceBetModal: React.FC<Props> = ({
  runner,
  race,
  isModalOpen,
  setIsModalOpen
}) => {
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo>();
  const [userBalance, setUserBalance] = useState<UserBalance>();
  const [wagerAmount, setWagerAmount] = useState<string>();
  const [payout, setPayout] = useState<string>();

  const { data: signer } = useSigner();

  const config = useConfig();
  const { getPotentialPayout } = useMarketContract();
  const { getBalance, getDecimals } = useERC20Contract();
  const { shouldRefetch, refetch: refetchUserBalance } = useRefetch();
  const { bets, addBet } = useBetSlipContext();
  const { number: raceNumber } = useParams();

  const back = useMemo<Back>(() => {
    if (!runner) return utils.mocks.getMockBack();

    return {
      nonce: runner.nonce,
      market_id: runner.market_id,
      close: runner.close,
      end: runner.end,
      odds: runner.odds,
      proposition_id: runner.proposition_id,
      signature: runner.signature
    };
  }, [runner]);

  useEffect(() => {
    if (!selectedMarket || !signer || !back || !wagerAmount || !userBalance)
      return setPayout("0");

    (async () => {
      setPayout(undefined);
      const payout = await getPotentialPayout(
        selectedMarket,
        ethers.utils.parseUnits(wagerAmount, userBalance.decimals),
        back,
        signer
      );
      setPayout(ethers.utils.formatUnits(payout, userBalance.decimals));
    })();
  }, [selectedMarket, signer, back, wagerAmount, userBalance, shouldRefetch]);

  useEffect(() => {
    if (!selectedMarket || !signer || !config) return;

    (async () => {
      setUserBalance(undefined);
      const assetAddress = utils.config.getVaultFromMarket(
        selectedMarket,
        config
      )!.asset.address;
      const [balance, decimals] = await Promise.all([
        getBalance(assetAddress, signer),
        getDecimals(assetAddress, signer)
      ]);

      setUserBalance({
        value: balance,
        decimals,
        formatted: utils.formatting.formatToFourDecimals(
          ethers.utils.formatUnits(balance, decimals)
        )
      });
    })();
  }, [selectedMarket, signer, config, shouldRefetch]);

  useEffect(() => {
    if (!config) return;

    setSelectedMarket(config.markets[0]);
  }, [config]);

  useEffect(() => {
    if (isModalOpen) return refetchUserBalance();

    setTimeout(() => {
      setWagerAmount(undefined);
    }, 300);
  }, [isModalOpen]);

  const onSelectMarket = (
    event: React.ChangeEvent<HTMLSelectElement>,
    config: Config
  ) => {
    const market = config.markets.find(
      m => m.address.toLowerCase() === event.currentTarget.value.toLowerCase()
    );
    setSelectedMarket(market);
  };

  const changeWagerAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userBalance) return;

    event.preventDefault();
    const value = event.currentTarget.value;

    if (value.includes(".")) {
      const decimals = value.split(".")[1];
      if (decimals.length > userBalance.decimals) {
        event.currentTarget.value = wagerAmount || "";
        return;
      }
    }

    setWagerAmount(value);
  };

  const onClickPlaceBet = useCallback(() => {
    if (
      !selectedMarket ||
      !wagerAmount ||
      !runner ||
      !config ||
      !race ||
      !raceNumber
    )
      return;
    const vault = utils.config.getVaultFromMarket(selectedMarket, config);
    if (!vault)
      throw new Error(
        `Could not find vault associated with market ${selectedMarket.address}`
      );

    addBet({
      market: selectedMarket,
      back,
      wager: ethers.utils
        .parseUnits(wagerAmount, vault.asset.decimals)
        .toString(),
      runner,
      race: {
        ...race,
        raceNumber
      },
      timestamp: Math.floor(Date.now() / 1000)
    });

    setIsModalOpen(false);
  }, [selectedMarket, back, wagerAmount, race, raceNumber]);

  const isWagerNegative = wagerAmount ? +wagerAmount < 0 : false;
  const isWagerGreaterThanBalance =
    wagerAmount && userBalance ? +wagerAmount > +userBalance.formatted : false;

  const isWagerPlusBetsExceedingBalance = useMemo(() => {
    if (
      !bets ||
      !bets.length ||
      !selectedMarket ||
      !wagerAmount ||
      !config ||
      !userBalance
    )
      return false;

    // find all bets for given market
    const betMarkets = bets.filter(
      bet =>
        bet.market.address.toLowerCase() ===
        selectedMarket.address.toLowerCase()
    );
    // get sum of all wagers
    const marketSum = betMarkets.reduce((sum, cur) => {
      const betVault = utils.config.getVaultFromMarket(cur.market, config);
      if (!betVault)
        throw new Error(
          `Could not find vault associated with market ${cur.market.address}`
        );

      const formatted = ethers.utils.formatUnits(
        cur.wager,
        betVault.asset.decimals
      );
      const bn = ethers.utils.parseUnits(formatted, betVault.asset.decimals);

      return sum.add(bn);
    }, ethers.constants.Zero);

    const marketVault = utils.config.getVaultFromMarket(selectedMarket, config);
    if (!marketVault)
      throw new Error(
        `Could not find vault associated with market ${selectedMarket.address}`
      );

    const userWagerBn = ethers.utils.parseUnits(
      wagerAmount,
      marketVault.asset.decimals
    );

    return marketSum.add(userWagerBn).gt(userBalance.value);
  }, [bets, wagerAmount, selectedMarket, config, userBalance]);

  return (
    <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      {!config || !runner ? (
        <div className="p-10">
          <Loader />
        </div>
      ) : (
        <div className="w-[70vw] lg:w-[28rem]">
          <h2 className="font-bold">
            {runner.name ? `${runner.name} (${runner.barrier ?? " "})` : " "}
          </h2>
          <h2 className="mr-[8vw] mb-6 font-bold">
            {`Target Odds 
            ${utils.formatting.formatToTwoDecimals(back.odds.toString())}`}
          </h2>
          <div className="flex flex-col">
            <h3 className="font-semibold">Markets</h3>
            <select
              onChange={e => onSelectMarket(e, config)}
              className="mt-1 mb-6 overflow-x-scroll border-[0.12rem] border-black bg-white"
            >
              {config.markets.map(market => (
                <option
                  key={market.address}
                  className="block"
                  value={market.address}
                >
                  {utils.config.getVaultNameFromMarket(market.address, config)}
                </option>
              ))}
            </select>
            <h3 className="font-semibold">Wager Amount</h3>
            <input
              type="number"
              placeholder="0"
              onChange={changeWagerAmount}
              className="mb-6 border-b-[0.12rem] border-black pl-1 pt-1 transition-colors duration-100 disabled:bg-white disabled:text-black/50"
            />
            <span className="block font-semibold">
              Payout:{" "}
              <span className="font-normal">
                {payout ? (
                  utils.formatting.formatToFourDecimals(payout)
                ) : (
                  <Loader size={14} />
                )}
              </span>
            </span>
            <span className="block font-semibold">
              Available:{" "}
              <span className="font-normal">
                {userBalance?.formatted || <Loader size={14} />}
              </span>
            </span>
            <span className="block font-semibold text-red-500">
              {isWagerNegative ? (
                <span className="mt-1 block">
                  Wager amount cannot be negative.
                </span>
              ) : isWagerPlusBetsExceedingBalance ? (
                <span className="mt-1 block">
                  Current bets plus wager cannot exceed balance.
                </span>
              ) : (
                isWagerGreaterThanBalance && (
                  <span className="mt-1 block">
                    Wager amount cannot be greater than token balance.
                  </span>
                )
              )}
            </span>
            <button
              className="relative top-6 mb-8 w-full rounded-md border-2 border-black py-2 font-bold transition-colors duration-100 disabled:border-black/50 disabled:bg-white disabled:text-black/50 hover:bg-black hover:text-white"
              onClick={onClickPlaceBet}
              disabled={
                !selectedMarket ||
                !wagerAmount ||
                !signer ||
                !userBalance ||
                !+userBalance.formatted ||
                isWagerNegative ||
                isWagerGreaterThanBalance ||
                isWagerPlusBetsExceedingBalance
              }
            >
              ADD TO BET SLIP
            </button>
          </div>
        </div>
      )}
    </BaseModal>
  );
};
