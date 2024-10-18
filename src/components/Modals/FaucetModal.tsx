import { ethers } from "ethers";
import { BaseModal } from ".";
import { Web3SuccessHandler } from "../Web3Handlers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
};

export const FaucetModal: React.FC<Props> = ({ isOpen, onClose, txHash }) => (
  <BaseModal isOpen={isOpen} onClose={onClose} isLarge>
    <Web3SuccessHandler
      hash={txHash || ethers.ZeroHash}
      message="Your tokens have been placed with"
    />
    <h2>It may take a few minutes to show up in your wallet.</h2>
  </BaseModal>
);
