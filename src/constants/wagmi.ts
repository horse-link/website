import { ethers, providers } from "ethers";
import { Chain, Connector } from "wagmi";
import { Address, normalizeChainId } from "@wagmi/core";
import { Network } from "../types/general";

// documentation:
// https://wagmi.sh/examples/custom-connector
// https://github.com/wagmi-dev/references/blob/9cb0535077504c27626b2e4bc32dc983d63a56ba/packages/connectors/src/coinbaseWallet.ts
// https://github.com/wagmi-dev/references/blob/9cb0535077504c27626b2e4bc32dc983d63a56ba/packages/connectors/src/walletConnect.ts

type Options = {
  wallet: ethers.Wallet;
  setChain: (chain: Network) => void;
};

export const LOCAL_WALLET_ID = "horselinkwallet";

export class HorseLinkWalletConnector extends Connector<
  providers.AlchemyProvider,
  Options,
  ethers.Signer
> {
  readonly id = LOCAL_WALLET_ID;
  readonly name = "HorseLink Wallet";
  readonly ready = true;

  // user wallet and network setter
  private _wallet: ethers.Wallet;

  private _chains: Array<Chain>;
  private _setChain: (chain: Network) => void;

  constructor({
    chains,
    options
  }: {
    chains?: Array<Chain>;
    options: Options;
  }) {
    if (!chains?.length) throw new Error("Cannot initialise without chains");

    super({
      chains,
      options
    });

    this._wallet = options.wallet;
    this._setChain = options.setChain;

    this._chains = chains;
  }

  // core
  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider();

      provider.on("accountsChanged", this.onAccountsChanged);
      provider.on("chainChanged", this.onChainChanged);
      provider.on("disconnect", this.onDisconnect);

      const id = chainId || (await this.getChainId());
      const account = await this.getAccount();

      return {
        account,
        chain: { id, unsupported: this.isChainUnsupported(id) },
        provider
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async disconnect() {
    if (!this._wallet) return;

    const provider = await this.getProvider();
    provider.removeListener("accountsChanged", this.onAccountsChanged);
    provider.removeListener("chainChanged", this.onChainChanged);
    provider.removeListener("disconnect", this.onDisconnect);
  }

  async switchChain(chainId: number): Promise<Chain> {
    const newChain = this._chains.find(c => c.id === chainId);
    if (!newChain) throw new Error(`No chain for id ${chainId}`);

    this._setChain(newChain);

    return newChain;
  }

  // utils
  isChainUnsupported(chainId: number): boolean {
    return !this._chains.map(c => c.id).includes(chainId);
  }

  async isAuthorized(): Promise<boolean> {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }

  // event listeners
  protected onAccountsChanged(accounts: Array<Address>): void {
    if (!accounts.length) {
      this.emit("disconnect");
      return;
    }

    this.emit("change", { account: ethers.getAddress(accounts[0]) });
  }

  protected onChainChanged(chain: string | number): void {
    const id = normalizeChainId(chain);
    this.emit("change", {
      chain: {
        id,
        unsupported: false
      }
    });
  }

  protected onDisconnect(): void {
    this.emit("disconnect");
  }

  // getters
  async getAccount() {
    const wallet = await this.getWallet();
    return ethers.getAddress(wallet.address);
  }

  async getChainId(): Promise<number> {
    const provider = await this.getProvider();
    return provider.network.chainId;
  }

  getWallet() {
    if (!this._wallet)
      throw new Error("The user wallet has not been generated yet");

    return this._wallet;
  }

  async getProvider() {
    const wallet = this.getWallet();
    return wallet.provider as providers.AlchemyProvider;
  }

  // required by class extension
  async getSigner() {
    return this.getWallet();
  }
}
