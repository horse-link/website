import { ethers } from "ethers";
import { useContext, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDebounce } from "use-debounce";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite
} from "wagmi";

import marketContractJson from "../../abi/Market.json";
import { WalletModalContext } from "../../providers/WalletModal";
import { Back } from "../../types";
import BackView from "./Back_View";

const DECIMALS = 6;

const useBacking = (back: Back) => {
  const { nonce, odds, proposition_id, market_id, close, end, signature } =
    back;

  const [wagerAmount, setWagerAmount] = useState<number>(0);
  const [debouncedWagerAmount] = useDebounce(wagerAmount, 500);

  const b32PropositionId = useMemo(
    () => ethers.utils.formatBytes32String(proposition_id),
    [proposition_id]
  );
  const bnOdds = useMemo(
    () => ethers.utils.parseUnits(odds.toString(), DECIMALS),
    [odds]
  );
  const bnWager = useMemo(
    () => ethers.utils.parseUnits(debouncedWagerAmount.toString(), DECIMALS),
    [debouncedWagerAmount]
  );
  const { data: bnPotentialPayout } = useContractRead({
    addressOrName: "0xe9BC1f42bF75C59b245d39483E97C3A70c450c9b",
    contractInterface: marketContractJson.abi,
    functionName: "getPotentialPayout",
    args: [b32PropositionId, bnWager, bnOdds]
  });

  const potentialPayout = useMemo(() => {
    if (!bnPotentialPayout) return "0";
    return ethers.utils.formatUnits(bnPotentialPayout, DECIMALS);
  }, [bnPotentialPayout]);

  const b32Nonce = useMemo(
    () => ethers.utils.formatBytes32String(nonce),
    [nonce]
  );
  const b32MarketId = useMemo(
    () => ethers.utils.formatBytes32String(market_id),
    [market_id]
  );

  const { config } = usePrepareContractWrite({
    addressOrName: "0xe9BC1f42bF75C59b245d39483E97C3A70c450c9b",
    contractInterface: marketContractJson.abi,
    functionName: "back",
    args: [
      b32Nonce,
      b32PropositionId,
      b32MarketId,
      bnWager,
      bnOdds,
      close,
      end,
      signature
    ]
  });

  const {
    data: backingResult,
    isLoading: isBacking,
    isSuccess: isBackingSuccess,
    write
  } = useContractWrite(config);
  const backTheRace = () => {
    // mock
    alert("call API");
    // if (!write) return;
    // write();
  };

  return {
    wagerAmount,
    setWagerAmount,
    potentialPayout,
    backTheRace,
    isBacking,
    isBackingSuccess,
    backingResult
  };
};

const BackLogic: React.FC = () => {
  const { propositionId } = useParams();
  const [searchParams] = useSearchParams();

  const marketId = searchParams.get("market_id");
  const odds = searchParams.get("odds");
  const close = searchParams.get("close");
  const end = searchParams.get("end");
  const nonce = searchParams.get("nonce");
  const signature = searchParams.get("signature");

  const { openWalletModal } = useContext(WalletModalContext);
  const { address } = useAccount();

  const back: Back = {
    nonce: Date.now().toString() || "",
    market_id: marketId || "",
    close: parseInt(close || "0"),
    end: parseInt(end || "0"),
    odds: parseFloat(odds || "0") / 1000,
    proposition_id: propositionId || "",
    signature: signature || ""
  };

  const {
    wagerAmount,
    setWagerAmount,
    potentialPayout,
    backTheRace,
    isBacking,
    isBackingSuccess,
    backingResult
  } = useBacking(back);

  return (
    <BackView
      back={back}
      openWalletModal={openWalletModal}
      isWalletConnected={address ? true : false}
      wagerAmount={wagerAmount}
      updateWagerAmount={amount => setWagerAmount(amount || 0)}
      potentialPayout={potentialPayout}
      backTheRace={backTheRace}
      isBacking={isBacking}
      isBackingSuccess={isBackingSuccess}
      backingResult={backingResult}
    />
  );
};

export default BackLogic;
