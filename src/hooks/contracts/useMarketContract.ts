import {
  ERC20__factory,
  MarketOracle__factory,
  Market__factory,
  Vault__factory
} from "../../typechain";
import { ethers, Signer } from "ethers";
import { Config, MarketInfo } from "../../types/config";
import utils from "../../utils";
import { Back, BackParams } from "../../types/meets";
import {
  BetHistory,
  MarketMultiBetInfo,
  SignedBetHistoryResponse2
} from "../../types/bets";
import constants from "../../constants";
import { formatting } from "horselink-sdk";

export const useMarketContract = () => {
  const placeMultipleBets = async (
    signer: Signer,
    data: Array<{
      back: Back;
      market: MarketInfo;
      wager: bigint;
    }>,
    skipAllowanceCheck?: boolean
  ) => {
    const userAddress = await signer.getAddress();
    const marketAddresses = [...new Set(data.map(d => d.market.address))];
    const marketLookup: { [marketAddress: string]: MarketMultiBetInfo } = {};

    const marketMultiBetInfoList: MarketMultiBetInfo[] = await Promise.all(
      marketAddresses.map(async marketAddress => {
        const marketContract = Market__factory.connect(marketAddress, signer);
        const vaultAddress = await marketContract.getVaultAddress();
        const vaultContract = Vault__factory.connect(vaultAddress, signer);
        const assetAddress = await vaultContract.asset();
        const tokenContract = ERC20__factory.connect(assetAddress, signer);
        const allowance = await tokenContract.allowance(
          userAddress,
          marketAddress
        );
        // const decimals = await vaultContract.decimals();
        const totalWagers = data
          .filter(
            d => d.market.address.toLowerCase() === marketAddress.toLowerCase()
          )
          .reduce((acc, curr) => {
            // return acc.add(ethers.parseUnits(curr.wager, decimals));
            return acc + curr.wager;
          }, 0n);
        const backs = data
          .filter(
            d => d.market.address.toLowerCase() === marketAddress.toLowerCase()
          )
          .map(d => {
            return { ...d.back, wager: d.wager };
          });
        const info: MarketMultiBetInfo = {
          marketContract,
          tokenContract,
          assetAddress,
          allowance,
          totalWagers,
          backs
        };
        marketLookup[marketAddress] = info;
        return info;
      })
    );

    // find which need to be increased
    const toProcess = marketMultiBetInfoList.filter(a =>
      a.allowance < a.totalWagers
    );

    // trigger allowances
    if (!skipAllowanceCheck) {
      await Promise.all(
        toProcess.map(async (p: MarketMultiBetInfo) => {
          const [gasLimit, gasPrice] = await Promise.all([
            p.tokenContract.estimateGas.approve(
              p.marketContract.address,
              ethers.constants.MaxUint256
            ),
            signer.getGasPrice()
          ]);

          return (
            await p.tokenContract.approve(
              p.marketContract.address,
              ethers.constants.MaxUint256,
              {
                gasLimit,
                gasPrice
              }
            )
          ).wait();
        })
      );
    }

    // place bets
    const transactionHashList: string[] = await Promise.all(
      marketMultiBetInfoList.map(async marketMultiBetInfo => {
        const backStructs = marketMultiBetInfo.backs.map((back: BackParams) => {
          return {
            nonce: back.nonce,
            propositionId: formatting.formatBytes16String(back.proposition_id),
            marketId: formatting.formatBytes16String(back.market_id),
            wager: back.wager,
            odds: ethers.parseUnits(
              back.odds.toString(),
              constants.contracts.MARKET_ODDS_DECIMALS
            ),
            close: back.close,
            end: back.end,
            signature: back.signature
          };
        });

        const [gasLimit, gasPrice] = await Promise.all([
          marketMultiBetInfo.marketContract.estimateGas.multiBack(backStructs),
          signer.getGasPrice()
        ]);

        const tx = await marketMultiBetInfo.marketContract.multiBack(
          backStructs,
          {
            gasLimit,
            gasPrice
          }
        );
        const receipt = await tx.wait();
        return receipt.transactionHash;
      })
    );
    return transactionHashList;
  };

  const placeBet = async (
    market: MarketInfo,
    back: Back,
    wager: BigNumber,
    signer: Signer,
    skipAllowanceCheck?: boolean
  ): Promise<string> => {
    const marketContract = Market__factory.connect(market.address, signer);
    const vaultContract = Vault__factory.connect(market.vaultAddress, signer);

    const userAddress = await signer.getAddress();
    const assetAddress = await vaultContract.asset();

    const erc20Contract = ERC20__factory.connect(assetAddress, signer);

    if (!skipAllowanceCheck) {
      const userAllowance = await erc20Contract.allowance(
        userAddress,
        market.address
      );
      if (userAllowance < wager) {
        const [gasLimit, gasPrice] = await Promise.all([
          erc20Contract.estimateGas.approve(
            market.address,
            ethers.MaxUint256
          ),
          signer.getGasPrice()
        ]);

        await (
          await erc20Contract.approve(
            market.address,
            ethers.MaxUint256,
            {
              gasLimit,
              gasPrice
            }
          )
        ).wait();
      }
    }

    const backData = {
      nonce: back.nonce,
      propositionId: formatting.formatBytes16String(back.proposition_id),
      marketId: formatting.formatBytes16String(back.market_id),
      wager,
      odds: ethers.parseUnits(
        back.odds.toString(),
        constants.contracts.MARKET_ODDS_DECIMALS
      ),
      close: back.close,
      end: back.end,
      signature: back.signature
    };

    const [gasLimit, gasPrice] = await Promise.all([
      marketContract.estimateGas.back(backData),
      signer.getGasPrice()
    ]);

    const receipt = await (
      await marketContract.back(backData, {
        gasLimit,
        gasPrice
      })
    ).wait();

    return receipt.transactionHash;
  };

  const setResult = async (
    { address }: MarketInfo,
    signer: Signer,
    bet: BetHistory,
    config: Config
  ) => {
    const marketContract = Market__factory.connect(address, signer);
    const oracleAddress = await marketContract.getOracleAddress();
    const marketOracleContract = MarketOracle__factory.connect(
      oracleAddress,
      signer
    );

    if (!bet.winningPropositionId || !bet.marketOracleResultSig)
      throw new Error("No winningPropositionId or marketOracleResultSig");

    if (
      !utils.bets.recoverSigSigner(
        bet.marketId,
        bet.winningPropositionId,
        bet.marketOracleResultSig,
        config
      )
    )
      throw new Error("Signature invalid");

    const [gasLimit, gasPrice] = await Promise.all([
      marketOracleContract.estimateGas.setResult(
        bet.marketId,
        bet.winningPropositionId,
        bet.marketOracleResultSig
      ),
      signer.getGasPrice()
    ]);

    // tx can fail if the result is already set
    await (
      await marketOracleContract.setResult(
        bet.marketId,
        bet.winningPropositionId,
        bet.marketOracleResultSig,
        {
          gasLimit,
          gasPrice
        }
      )
    ).wait();
  };

  const settleBet = async (
    market: MarketInfo,
    bet: SignedBetHistoryResponse2,
    signer: Signer,
    config: Config
  ) => {
    const marketContract = Market__factory.connect(market.address, signer);
    const oracleAddress = await marketContract.getOracleAddress();
    const marketOracleContract = MarketOracle__factory.connect(
      oracleAddress,
      signer
    );

    const isScratched = bet.status === "SCRATCHED";

    const marketId = utils.markets.getMarketIdFromPropositionId(
      bet.propositionId
    );

    if (bet.marketOracleResultSig && !isScratched) {
      if (
        bet.winningPropositionId &&
        bet.marketOracleResultSig &&
        !utils.bets.recoverSigSigner(
          formatting.formatBytes16String(marketId),
          bet.winningPropositionId,
          bet.marketOracleResultSig,
          config
        )
      )
        throw new Error("Signature invalid");

      if (
        !bet.marketResultAdded &&
        bet.winningPropositionId &&
        bet.marketOracleResultSig
      ) {
        const [gasLimit, gasPrice] = await Promise.all([
          marketOracleContract.estimateGas.setResult(
            formatting.formatBytes16String(marketId),
            bet.winningPropositionId,
            bet.marketOracleResultSig
          ),
          signer.getGasPrice()
        ]);

        await (
          await marketOracleContract.setResult(
            formatting.formatBytes16String(marketId),
            bet.winningPropositionId,
            bet.marketOracleResultSig,
            {
              gasLimit,
              gasPrice
            }
          )
        ).wait();
      }
    } else if (isScratched && bet.scratched?.signature) {
      if (
        !utils.bets.recoverSigSigner(
          formatting.formatBytes16String(marketId),
          bet.propositionId,
          bet.scratched.signature,
          config,
          ethers.parseUnits(
            bet.scratched.odds.toString(),
            constants.contracts.MARKET_ODDS_DECIMALS
          ),
          BigInt(bet.scratched.totalOdds)
        )
      )
        throw new Error("Signature invalid");

      const [gasLimit, gasPrice] = await Promise.all([
        marketOracleContract.estimateGas.setScratchedResult(
          formatting.formatBytes16String(marketId),
          bet.propositionId,
          ethers.parseUnits(
            bet.scratched.odds.toString(),
            constants.contracts.MARKET_ODDS_DECIMALS
          ),
          BigInt(bet.scratched.totalOdds),
          bet.scratched.signature
        ),
        signer.getGasPrice()
      ]);

      // tx can fail if the result is already set
      await (
        await marketOracleContract.setScratchedResult(
          formatting.formatBytes16String(marketId),
          bet.propositionId,
          ethers.parseUnits(
            bet.scratched.odds.toString(),
            constants.contracts.MARKET_ODDS_DECIMALS
          ),
          BigInt(bet.scratched.totalOdds),
          bet.scratched.signature,
          {
            gasLimit,
            gasPrice
          }
        )
      ).wait();
    }

    const [gasLimit, gasPrice] = await Promise.all([
      marketContract.estimateGas.settle(bet.index),
      signer.getGasPrice()
    ]);

    const receipt = await (
      await marketContract.settle(bet.index, {
        gasLimit,
        gasPrice
      })
    ).wait();

    return receipt.transactionHash;
  };

  const getPotentialPayout = async (
    market: MarketInfo,
    wager: bigint,
    back: Back,
    signer: Signer
  ): Promise<bigint> => {
    const marketContract = Market__factory.connect(market.address, signer);

    const odds: bigint = ethers.parseUnits(
      back.odds.toString(),
      constants.contracts.MARKET_ODDS_DECIMALS
    );

    const payout: bigint = await marketContract.getPotentialPayout(
      formatting.formatBytes16String(back.proposition_id),
      formatting.formatBytes16String(back.market_id),
      wager,
      odds
    );

    return payout;
  };

  const refundBet = async (
    market: MarketInfo,
    bet: SignedBetHistoryResponse2,
    signer: Signer
  ): Promise<string> => {
    const marketContract = Market__factory.connect(market.address, signer);
    const odds: bigint = ethers.parseUnits(
      bet.scratched!.odds.toFixed(constants.contracts.MARKET_ODDS_DECIMALS),
      constants.contracts.MARKET_ODDS_DECIMALS
    );

    const marketId = utils.markets.getMarketIdFromPropositionId(
      bet.propositionId
    );

    const [gasLimit, gasPrice] = await Promise.all([
      marketContract.estimateGas.scratchAndRefund(
        bet.index,
        marketId,
        bet.propositionId,
        odds,
        bet.scratched!.signature!
      ),
      signer.getGasPrice()
    ]);

    const receipt = await (
      await marketContract.scratchAndRefund(
        bet.index,
        marketId,
        bet.propositionId,
        odds,
        bet.scratched!.signature!,
        {
          gasLimit,
          gasPrice
        }
      )
    ).wait();

    return receipt.transactionHash;
  };

  return {
    placeBet,
    settleBet,
    getPotentialPayout,
    setResult,
    placeMultipleBets,
    refundBet
  };
};
