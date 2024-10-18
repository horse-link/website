import { sepolia, arbitrum } from "wagmi/chains";
import { ethers } from "ethers";

export const BYTES_16_ZERO = "0x00000000000000000000000000000000";

export const ONE_ETHER = ethers.parseEther("1");

export const CHAINS = [arbitrum, sepolia];
