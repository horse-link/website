// import { createConnector } from "@wagmi/core";
// import { Network } from "../types/general";
// import { AlchemyProvider, Wallet } from "ethers";
// import { Chain } from "wagmi/chains";
// import { Address } from "viem";

// export type HorseLinkWalletOptions = {
//   wallet: Wallet;
//   setChain: (chain: Network) => void;
//   chains: Chain[];
// };

// export const HorseLinkWalletConnector = createConnector<
//   AlchemyProvider,
//   HorseLinkWalletOptions
// >(config => {
//   let wallet: Wallet;
//   let setChain: (chain: Network) => void;
//   let chains: Chain[];

//   return {
//     id: "horselinkwallet",
//     name: "HorseLink Wallet",
//     type: "horselinkwallet",

//     setup(options) {
//       wallet = options.wallet;
//       setChain = options.setChain;
//       chains = options.chains;
//     },

//     async connect({ chainId }: { chainId?: number } = {}) {
//       const provider = await this.getProvider();
//       const accounts = await this.getAccounts();
//       const account = accounts[0]; // Get the first account
//       const id = chainId || (await this.getChainId());

//       return {
//         account,
//         chain: { id, unsupported: this.isChainUnsupported(id) },
//         provider
//       };
//     },

//     async disconnect() {
//       const provider = await this.getProvider();
//       provider.removeAllListeners();
//     },

//     async getAccount() {
//       return wallet.address as Address;
//     },

//     async getAccounts() {
//       return [wallet.address as Address];
//     },

//     async getChainId() {
//       const provider = await this.getProvider();
//       const network = await provider.getNetwork();
//       return network.chainId;
//     },

//     async getProvider() {
//       return wallet.provider as AlchemyProvider;
//     },

//     async getSigner() {
//       return wallet;
//     },

//     async isAuthorized() {
//       try {
//         const accounts = await this.getAccounts();
//         const account = accounts[0];
//         return !!account;
//       } catch {
//         return false;
//       }
//     },

//     async switchChain(chainId: number) {
//       const chain = chains.find(c => c.id === chainId);
//       if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
//       setChain(chain as Network);
//       return chain;
//     },

//     onAccountsChanged(accounts: string[]) {
//       if (accounts.length === 0) config.emitter.emit("disconnect");
//       else config.emitter.emit("change", { accounts: accounts as Address[] });
//     },

//     onChainChanged(chainId: string | number) {
//       const id = Number(chainId);
//       config.emitter.emit("change", {
//         chain: { id, unsupported: this.isChainUnsupported(id) }
//       });
//     },

//     onDisconnect() {
//       config.emitter.emit("disconnect");
//     },

//     isChainUnsupported(chainId: number) {
//       return !chains.some(x => x.id === chainId);
//     },

//     async getWalletClient() {
//       // Implement if needed
//       throw new Error("getWalletClient not implemented");
//     },

//     async getClient() {
//       // Implement if needed
//       throw new Error("getClient not implemented");
//     }
//   };
// });

export const LOCAL_WALLET_ID = "local";
