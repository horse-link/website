import { createConnector } from '@wagmi/core'

import { Network } from "../types/general"
import { AlchemyProvider, Wallet } from 'ethers'
import { Chain } from 'wagmi/chains'
import { type Address } from 'viem'

export type HorseLinkWalletOptions = {
  wallet: Wallet
  setChain: (chain: Network) => void
  chains: Chain[]
}

export const horseLinkWalletConnector = ({ wallet, setChain, chains }: HorseLinkWalletOptions) => {
  return createConnector((config) => ({
    id: 'horselinkwallet',
    name: 'HorseLink Wallet',
    type: 'horselinkwallet',
    
    connect: async ({ chainId }) => {
      const provider = await getProvider()
      const account = await getAccount()
      const id = chainId || (await getChainId())
      
      return { account, chain: { id, unsupported: isChainUnsupported(id) }, provider }
    },
    
    disconnect: async () => {
      const provider = await getProvider()
      provider.removeAllListeners()
    },
    
    getAccount: async () => {
      return wallet.address
    },
    
    
    // getProvider: async () => {
    //   return wallet.provider as AlchemyProvider
    // },
    
    getSigner: async () => {
      return wallet
    },
    
    isAuthorized: async () => {
      try {
        const account = await getAccount()
        return !!account
      } catch {
        return false
      }
    },
    
    switchChain: async (chain) => {
      const newChain = chains.find(c => c.id === chain.chainId)
      if (!newChain) throw new Error(`Unsupported chain id: ${chain.chainId}`)
      
      setChain(newChain as Network) // Assuming Network is compatible with Chain
      return {
        id: newChain.id,
        name: newChain.name,
        network: newChain.id,
        nativeCurrency: newChain.nativeCurrency,
        rpcUrls: newChain.rpcUrls
      }
    },
    
    onAccountsChanged: (accounts) => {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect')
      } else {
        config.emitter.emit('change', { accounts: accounts })
      }
    },
    
    onChainChanged: (chain) => {
      const chainId = Number(chain)
      config.emitter.emit('change', { chainId  })
    },
    
    onDisconnect: () => {
      config.emitter.emit('disconnect')
    },
  }))
  
  function isChainUnsupported(chainId: number): boolean {
    return !chains.map(c => c.id).includes(chainId)
  }
  
  async function getAccount() {
    return wallet.address
  }
  
  async function getChainId() {
    const provider: AlchemyProvider = await getProvider()
    return provider.getNetwork().then((network) => network.chainId)
  }
  
  async function getProvider() {
    return wallet.provider as AlchemyProvider
  }
}
/*
// Below is the existing connector that we are refactoring to use the new wagmi connector system
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

    this.emit("change", { account: ethers.utils.getAddress(accounts[0]) });
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
    return ethers.utils.getAddress(wallet.address);
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
*/
