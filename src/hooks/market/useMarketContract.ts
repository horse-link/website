import { Market__factory } from "../../typechain";
import { Back } from "../../types";
import { BigNumber, ethers, Signer } from "ethers";

const useMarketContract = () => {
  const placeBet = async (marketAddress: string, back: Back, wager: BigNumber, signer: Signer) => {
    const contract = Market__factory.connect(marketAddress, signer);

    const receipt = await (
      await contract.back(
        ethers.utils.formatBytes32String(back.nonce), 
        ethers.utils.formatBytes32String(back.proposition_id), 
        ethers.utils.formatBytes32String(back.market_id), 
        wager, 
        ethers.utils.parseEther(back.odds.toString()), 
        ethers.utils.parseEther(back.close.toString()), 
        ethers.utils.parseEther(back.end.toString()), 
        back.signature
      )
    ).wait();

    return receipt.transactionHash;
  };

  return {
    placeBet,
  }
};

export default useMarketContract;