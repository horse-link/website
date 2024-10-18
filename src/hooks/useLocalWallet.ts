// import { ethers } from "ethers";
// import { useMemo, useState } from "react";
// import utils from "../utils";
// import constants from "../constants";
// import { Network } from "../types/general";

export const LS_PRIVATE_KEY = "horse.link-wallet-key";
export const LAST_KNOWN_LS_KEY = "horse.link-network-id";

// export const useLocalWallet = (chains: Array<Network>) => {
//   // was there a last known chain
//   const lastKnown = localStorage.getItem(LAST_KNOWN_LS_KEY);
//   const lastKnownChain: Chain | undefined = lastKnown
//     ? constants.blockchain.CHAINS.find(c => c.id === +lastKnown)
//     : undefined;

//   const [chain, setChain] = useState<Network>(
//     lastKnownChain || constants.blockchain.CHAINS[0]
//   );

//   // get keys
//   const localKey = localStorage.getItem(LS_PRIVATE_KEY);

//   // provider array
//   const providers = useMemo(
//     () =>
//       chains.map(c => {
//         const { name } = utils.formatting.formatChain(c);
//         console.log(`Creating provider for ${name}`);
//         // TODO propery mapping for each chain, just loading from env now
//         return new ethers.providers.JsonRpcProvider({
//           url: `${constants.env.RPC_URL}`
//         });
//       }),
//     [chains]
//   );

//   const wallet = useMemo(() => {
//     const provider = providers[0]; // providers.find(p => p._network.chainId === chain.id);
//     if (!provider) throw new Error(`No provider available`);

//     if (!localKey) {
//       const randomWallet = ethers.Wallet.createRandom();
//       const generatedWallet = new ethers.Wallet(
//         randomWallet.privateKey,
//         provider
//       );

//       const encrypted = utils.general.encryptString(
//         generatedWallet.privateKey,
//         constants.env.SALT
//       );
//       localStorage.setItem(LS_PRIVATE_KEY, encrypted);

//       return generatedWallet;
//     }

//     const decrypted = utils.general.decryptString(localKey, constants.env.SALT);
//     return new ethers.Wallet(decrypted, provider);
//   }, [localKey, providers, chain]);

//   return {
//     wallet,
//     setChain
//   };
// };
