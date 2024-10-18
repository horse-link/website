import { ethers } from "ethers";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useConfig } from "../../providers/Config";
import { useSigner } from "wagmi";
import { Loader } from "..";
import { BaseModal } from ".";
import { useMarketContract, useERC20Contract } from "../../hooks/contracts";
import useRefetch from "../../hooks/useRefetch";
import utils from "../../utils";
import { Back } from "../../types/meets";
import { UserBalance } from "../../types/users";
import { useBetSlipContext } from "../../providers/BetSlip";
import { useParams } from "react-router-dom";
import { useTokenContext } from "../../providers/Token";
import { BetEntry, BetSlipEntry } from "../../types/context";
import { Button } from "../Buttons";
import classNames from "classnames";
import { formatting, Race, Runner, VaultInfo } from "horselink-sdk";

type Props = {
  runner?: Runner;
  race?: Race;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
};

const defaultUserBalance: UserBalance = {
  value: 0n, // Changed from ethers.constants.Zero to 0n
  decimals: 6,
  formatted: "0.0000"
};

// const convert = (amount: string) => {
//   winWagerAmount.toString(),
//   userBalance.decimals
// };

export const BetModal: React.FC<Props> = ({
  runner,
  race,
  isModalOpen,
  setIsModalOpen
}) => {
  const [userBalance, setUserBalance] =
    useState<UserBalance>(defaultUserBalance);

  // use string for the controlled input
  const [winWagerAmount, setWinWagerAmount] = useState<string>();
  const [placeWagerAmount, setPlaceWagerAmount] = useState<string>();

  const [payout, setPayout] = useState<bigint>(0n); // Changed from ethers.BigNumber to bigint
  const { data: signer } = useSigner();

  const config = useConfig();
  const { getPotentialPayout } = useMarketContract();
  const { getBalance, getDecimals } = useERC20Contract();
  const { shouldRefetch, refetch: refetchUserBalance } = useRefetch();
  const { bets, addBet, placeBetImmediately, forceNewSigner } =
    useBetSlipContext();
  const { number: raceNumber } = useParams();
  const { currentToken } = useTokenContext();

  // If there is a win or place bet. zero values don't count
  const hasBet = (): Boolean => {
    const winWager = ethers.parseUnits(
      winWagerAmount || "0",
      userBalance.decimals
    );

    const placeWager = ethers.parseUnits(
      placeWagerAmount || "0",
      userBalance.decimals
    );

    return winWager !== 0n || placeWager !== 0n;
  };

  useEffect(() => {
    if (!signer) return;

    forceNewSigner(signer);
  }, [signer]);

  const market = useMemo(() => {
    if (!config || !currentToken) return;

    return utils.config.getMarketFromToken(currentToken, config);
  }, [config, currentToken]);

  const backWin = useMemo<Back>(() => {
    // remove this
    if (!runner) return utils.mocks.getMockBack();

    const win: Back = runner.backs.find(back => back.type === "win")!;

    return {
      nonce: win.nonce,
      market_id: win.market_id,
      close: win.close,
      end: win.end,
      odds: win.odds,
      proposition_id: win.proposition_id,
      signature: win.signature
    };
  }, [runner]);

  const backPlace = useMemo<Back>(() => {
    // remove this
    if (!runner) return utils.mocks.getMockBack();

    const place: Back = runner.backs.find(back => back.type === "place")!;

    return {
      nonce: place.nonce,
      market_id: place.market_id,
      close: place.close,
      end: place.end,
      odds: place.odds,
      proposition_id: place.proposition_id, //`${runner.market_id}W${runner.number.toString().padStart(2, "0")}`,
      signature: place.signature
    };
  }, [runner]);

  useEffect(() => {
    if (!market || !signer || !backWin) {
      return setPayout(0n);
    }

    if (!winWagerAmount && !placeWagerAmount) {
      return setPayout(0n);
    }

    (async () => {
      setPayout(0n);
      let calculatedPayout = 0n;

      const placeWager = ethers.parseUnits(
        placeWagerAmount || "0",
        userBalance.decimals
      );

      const winWager = ethers.parseUnits(
        winWagerAmount || "0",
        userBalance.decimals
      );

      // do in parallel
      if (winWager !== 0n) {
        const payout = await getPotentialPayout(
          market,
          winWager,
          backWin,
          signer
        );

        calculatedPayout = calculatedPayout + payout;
      }

      // do in parallel
      if (placeWager !== 0n) {
        const payout = await getPotentialPayout(
          market,
          placeWager,
          backPlace,
          signer
        );

        calculatedPayout = calculatedPayout + payout;
      }

      if (!calculatedPayout) setPayout(calculatedPayout);
    })();
  }, [
    market,
    signer,
    backWin,
    winWagerAmount,
    backPlace,
    placeWagerAmount,
    userBalance,
    shouldRefetch
  ]);

  useEffect(() => {
    if (!market || !signer || !config) return;

    (async () => {
      setUserBalance(defaultUserBalance);

      const assetAddress = utils.config.getVaultFromMarket(market, config)!
        .asset.address;

      const [balance, decimals] = await Promise.all([
        getBalance(assetAddress, signer),
        getDecimals(assetAddress, signer)
      ]);

      setUserBalance({
        value: balance,
        decimals,
        formatted: formatting.formatToFourDecimals(
          ethers.formatUnits(balance, decimals)
        )
      });
    })();
  }, [market, signer, config, shouldRefetch]);

  useEffect(() => {
    if (isModalOpen) return refetchUserBalance();

    setTimeout(() => {
      setWinWagerAmount(undefined);
      setPlaceWagerAmount(undefined);
    }, 300);
  }, [isModalOpen]);

  const changeWinWagerAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.currentTarget.value;

    // make this a utils function with a unit test
    if (!RegExp(/^[(\d|.)]*$/).test(value)) return;

    if (value.includes(".")) {
      const decimals = value.split(".")[1];

      if (decimals.length > userBalance.decimals) {
        event.currentTarget.value = winWagerAmount || "";
        return;
      }
    }

    setWinWagerAmount(value);
  };

  const changePlaceWagerAmount = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const value = event.currentTarget.value;

    if (!RegExp(/^[(\d|.)]*$/).test(value)) return;

    if (value.includes(".")) {
      const decimals = value.split(".")[1];
      if (decimals.length > userBalance.decimals) {
        event.currentTarget.value = winWagerAmount || "";
        return;
      }
    }

    setPlaceWagerAmount(value);
  };

  const onClickPlaceBet = useCallback(
    async (option?: { betNow: boolean }) => {
      if (!market || !hasBet() || !runner || !config || !race || !raceNumber)
        return;

      const vault = utils.config.getVaultFromMarket(market, config);

      if (!vault)
        throw new Error(
          `Could not find vault associated with market ${market.address}`
        );

      const placeWager = ethers.parseUnits(
        placeWagerAmount || "0",
        userBalance.decimals
        // vault.asset.decimals
      );

      // todo: check wager is not zero
      const placeBetSlip: BetEntry = {
        market,
        back: backPlace,
        wager: placeWager,
        runner,
        name: race.name,
        number: race.number,
        timestamp: Math.floor(Date.now() / 1000)
      };

      const winWager = ethers.parseUnits(
        winWagerAmount || "0",
        userBalance.decimals
        // vault.asset.decimals
      );

      // todo: check wager is not zero
      const winBetSlip: BetEntry = {
        market,
        back: backWin,
        wager: winWager,
        runner,
        name: race.name,
        number: race.number,
        timestamp: Math.floor(Date.now() / 1000)
      };

      setIsModalOpen(false);

      if (option?.betNow) {
        await placeBetImmediately(winBetSlip);
      } else {
        if (!placeBetSlip.wager.isZero()) {
          console.log("adding place bet");
          addBet(placeBetSlip);
        }

        if (!winBetSlip.wager.isZero()) {
          console.log("adding win bet");
          addBet(winBetSlip);
        }
      }
    },
    [
      market,
      backPlace,
      backWin,
      placeWagerAmount,
      winWagerAmount,
      race,
      raceNumber
    ]
  );

  const isWagerNegative = winWagerAmount ? +winWagerAmount < 0 : false;
  //const isPlaceWagerNegative = placeWagerAmount < 0;

  const isWagerGreaterThanBalance =
    winWagerAmount && userBalance
      ? +winWagerAmount > +userBalance.value
      : false;

  // const isPlaceWagerGreaterThanBalance =
  //   userBalance && placeWagerAmount > +userBalance.value;

  const isWagerPlusBetsExceedingBalance: boolean = useMemo(() => {
    if (
      !bets ||
      !bets.length ||
      !market ||
      // !winWagerAmount ||
      !hasBet() ||
      !config ||
      !userBalance
    )
      return false;

    // find all bets for given market
    const betMarkets: BetSlipEntry[] = bets.filter(
      bet => bet.market.address.toLowerCase() === market.address.toLowerCase()
    );

    // get sum of all wagers
    const marketSum = betMarkets.reduce((sum, cur) => {
      const betVault: VaultInfo = utils.config.getVaultFromMarket(
        cur.market,
        config
      );
      if (!betVault)
        throw new Error(
          `Could not find vault associated with market ${cur.market.address}`
        );

      const formatted = ethers.formatUnits(cur.wager, betVault.asset.decimals);

      const bn = ethers.parseUnits(formatted, betVault.asset.decimals);

      return sum + bn; // Changed from sum.add(bn) to sum + bn
    }, 0n); // Changed from ethers.constants.Zero to 0n

    const marketVault = utils.config.getVaultFromMarket(market, config);
    if (!marketVault)
      throw new Error(
        `Could not find vault associated with market ${market.address}`
      );

    const placeWager = ethers.parseUnits(
      placeWagerAmount || "0",
      userBalance.decimals
      // marketVault.asset.decimals
    );

    const winWager = ethers.parseUnits(
      winWagerAmount || "0",
      userBalance.decimals
      // marketVault.asset.decimals
    );

    return marketSum + winWager + placeWager > userBalance.value; // Changed from .gt() to >
  }, [bets, placeWagerAmount, winWagerAmount, market, config, userBalance]);

  const isScratched = runner
    ? utils.races.isScratchedRunner(runner)
    : undefined;

  const shouldDisableBet =
    !market ||
    !signer ||
    !userBalance ||
    !+userBalance.formatted ||
    isWagerNegative ||
    isWagerGreaterThanBalance ||
    isWagerPlusBetsExceedingBalance;

  return (
    <BaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      {!config || !runner ? (
        <div className="p-10">
          <Loader />
        </div>
      ) : (
        <div className="p-6">
          <h2
            className={classNames("font-basement text-[32px] tracking-wider", {
              "break-words": runner.name.length > 10
            })}
          >
            {runner.name} ({runner.number})
          </h2>

          <div className="mt-8 flex w-full flex-col items-center gap-y-4 divide-y divide-hl-border">
            <div className="grid w-full grid-cols-2 grid-rows-2 gap-x-2">
              <h3 className="text-left text-hl-secondary">Target win:</h3>
              <p className="text-left text-hl-tertiary">
                {formatting.formatToTwoDecimals(backWin.odds.toString())}
              </p>
              <div className="flex items-center">
                <h3 className="text-left text-hl-secondary">Win amount:</h3>
              </div>

              {/* desktop */}
              <input
                placeholder="0"
                value={winWagerAmount}
                onChange={changeWinWagerAmount}
                className="hidden border border-hl-border bg-hl-background p-2 text-hl-primary !outline-none !ring-0 lg:block"
                disabled={isScratched === true}
              />

              <h3 className="text-left text-hl-secondary">Target place:</h3>
              <p className="text-left text-hl-tertiary">
                {formatting.formatToTwoDecimals(backPlace.odds.toString())}
              </p>
              <div className="flex items-center">
                <h3 className="text-left text-hl-secondary">Place amount:</h3>
              </div>

              {/* desktop */}
              <input
                placeholder="0"
                value={placeWagerAmount}
                onChange={changePlaceWagerAmount}
                className="hidden border border-hl-border bg-hl-background p-2 text-hl-primary !outline-none !ring-0 lg:block"
                disabled={isScratched === true}
              />

              {/* mobile */}
              <input
                placeholder="0"
                value={winWagerAmount}
                type="number"
                onChange={changeWinWagerAmount}
                className="block border border-hl-border bg-hl-background p-2 text-hl-primary !outline-none !ring-0 lg:hidden"
                disabled={isScratched === true}
              />
            </div>

            <div className="grid w-full grid-cols-2 grid-rows-2 gap-2 pt-4">
              <h3 className="text-left text-hl-secondary">Payout:</h3>
              <p className="text-left text-hl-tertiary">
                {ethers.formatUnits(payout, userBalance?.decimals || 0)}
              </p>
              <div className="flex items-center">
                <h3 className="text-left text-hl-secondary">Available:</h3>
              </div>
              <p className="text-left text-hl-tertiary">
                {userBalance?.formatted || "0.0000"} {currentToken?.symbol}
              </p>
            </div>
          </div>

          <span className="block font-semibold text-red-500">
            {isWagerNegative ? (
              <span className="my-6 block">
                Wager amount cannot be negative.
              </span>
            ) : isWagerPlusBetsExceedingBalance ? (
              <span className="my-6 block">
                Current bets plus wager cannot exceed balance.
              </span>
            ) : (
              isWagerGreaterThanBalance && (
                <span className="my-6 block">
                  Wager amount cannot be greater than token balance.
                </span>
              )
            )}
          </span>

          <div className="mt-4 mb-2 flex flex-col gap-2">
            <Button
              big
              white
              rounded
              text="bet now"
              onClick={() => onClickPlaceBet({ betNow: true })}
              disabled={shouldDisableBet || isScratched === true}
              active={!shouldDisableBet && isScratched !== true}
            />
            <span className=" blockself-center font-semibold">or</span>
            <Button
              big
              rounded
              text="add to bet slip"
              onClick={() => onClickPlaceBet()}
              disabled={shouldDisableBet || isScratched === true}
              active={!shouldDisableBet && hasBet() && isScratched !== true}
            />
          </div>
        </div>
      )}
    </BaseModal>
  );
};
