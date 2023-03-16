import { ethers, providers } from "ethers";
import {
  AddChainError,
  Chain,
  ChainNotConfiguredError,
  Connector,
  ProviderRpcError,
  SwitchChainError,
  UserRejectedRequestError,
  chain
} from "wagmi";

// documentation:
// https://wagmi.sh/examples/custom-connector
// https://github.com/wagmi-dev/references/blob/9cb0535077504c27626b2e4bc32dc983d63a56ba/packages/connectors/src/coinbaseWallet.ts
// https://github.com/wagmi-dev/references/blob/9cb0535077504c27626b2e4bc32dc983d63a56ba/packages/connectors/src/walletConnect.ts

// node_modules/@ethersproject/networks/src.ts/types.ts/Networkish
type EthersNetwork = {
  name: string;
  chainId: number;
  ensAddress?: string;
  _defaultProvider?: (providers: any, options?: any) => any;
};

// node_modules/@ethersproject/providers/src.ts/url-json-rpc-provider.ts:53
type Options = {
  network?: EthersNetwork | string | number;
  apiKey?: any;
};

export class HorseLinkWalletConnector extends Connector<
  providers.AlchemyProvider,
  Options,
  providers.JsonRpcSigner
> {
  readonly id = "hlWallet";
  readonly name = "HL Wallet";
  readonly ready = true;

  // fallbacks, ETH mainnet for now
  readonly fallbackChainId = 1;
  readonly fallbackChain = {
    id: this.fallbackChainId,
    get name() {
      return `Chain ${this.id}`;
    },
    get network() {
      return this.id.toString();
    },
    nativeCurrency: { name: "Ether", decimals: 18, symbol: "ETH" },
    rpcUrls: { default: "", public: "" }
  };

  #provider?: providers.AlchemyProvider;

  constructor({ chains, options }: { chains?: Chain[]; options: Options }) {
    super({
      chains,
      options
    });
  }

  // core
  async connect({ chainId }: { chainId?: number } = {}) {
    const provider = await this.getProvider();

    provider.on("accountsChanged", this.onAccountsChanged);
    provider.on("chainChanged", this.onChainChanged);
    provider.on("disconnect", this.onDisconnect);

    let id = await this.getChainId();
    if (chainId && id !== chainId) {
      const chain = await this.switchChain(chainId);
      id = chain.id;
    }

    const account: any = undefined; // replace with local wallet

    return {
      account: account.address,
      chain: { id, unsupported: this.isChainUnsupported(id) },
      provider: this.#provider
    };
  }

  async disconnect() {
    if (!this.#provider) return;

    const provider = await this.getProvider();
    provider.removeListener("accountsChanged", this.onAccountsChanged);
    provider.removeListener("chainChanged", this.onChainChanged);
    provider.removeListener("disconnect", this.onDisconnect);

    this.#provider = undefined;
  }

  async switchChain(chainId: number): Promise<Chain> {
    const provider = await this.getProvider();
    const id = ethers.utils.hexValue(chainId);

    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: id }]);
      return (
        this.chains.find(chain => chain.id === chainId) || this.fallbackChain
      );
    } catch (e) {
      const chain = this.chains.find(chain => chain.id === chainId);
      if (!chain)
        throw new ChainNotConfiguredError({ chainId, connectorId: this.id });

      // indicates chain is not added to provider
      if ((e as ProviderRpcError).code === 4902) {
        try {
          const newChainToAdd = {
            chainId: id,
            chainName: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: [chain.rpcUrls.public || ""],
            blockExplorerUrls: this.getBlockExplorerUrls(chain)
          };
          await provider.send("wallet_addEthereumChain", [newChainToAdd]);

          return chain;
        } catch (addError) {
          if (this.isUserRejectedRequestError(addError))
            throw new UserRejectedRequestError(addError);
          throw new AddChainError();
        }
      }

      if (this.isUserRejectedRequestError(e))
        throw new UserRejectedRequestError(e);
      throw new SwitchChainError(e);
    }
  }

  // event listeners
  protected onAccountsChanged(accounts: `0x${string}`[]): void {
    if (!accounts.length) {
      this.emit("disconnect");
      return;
    }

    this.emit("change", { account: accounts[0] });
    return;
  }

  protected onChainChanged(chain: string | number): void {
    const unsupported = this.isChainUnsupported(+chain);
    this.emit("change", {
      chain: {
        id: +chain,
        unsupported
      }
    });
    return;
  }

  protected onDisconnect(): void {
    this.emit("disconnect");
    return;
  }

  // getters
  async getAccount() {
    const provider = await this.getProvider();
    const accounts = await provider.listAccounts();
    return ethers.utils.getAddress(accounts[0]);
  }

  async getChainId(): Promise<number> {
    const provider = await this.getProvider();
    return provider.network.chainId;
  }

  async getProvider() {
    const { network, apiKey } = super.options;
    return this.#provider || new providers.AlchemyProvider(network, apiKey);
  }

  async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
    const provider = await this.getProvider();
    return provider.getSigner();
  }

  // utils
  isChainUnsupported(chainId: number): boolean {
    const supportedNetworks = [chain.arbitrum.id, chain.goerli.id];
    return !supportedNetworks.includes(chainId);
  }

  isUserRejectedRequestError(e: unknown) {
    return /(user rejected)/i.test((e as Error).message);
  }

  async isAuthorized(): Promise<boolean> {
    try {
      const account = await this.getAccount();
      return !!account;
    } catch {
      return false;
    }
  }
}
