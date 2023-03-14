import React, { useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from "wagmi";
import utils from "../utils";
import { BaseButton } from "./Buttons";
import { useTokenContext } from "../providers/Token";
import ClipLoader from "react-spinners/ClipLoader";
import { UserBalance } from "../types/users";
import { useERC20Contract } from "../hooks/contracts";
import { ethers } from "ethers";
import { useWalletModal } from "../providers/WalletModal";
import { Listbox, Transition } from "@headlessui/react";

export const AccountPanel: React.FC = () => {
  const { currentToken, tokensLoading, openModal } = useTokenContext();

  const { openWalletModal } = useWalletModal();
  const account = useAccount();
  const { data: signer } = useSigner();
  const { getBalance } = useERC20Contract();
  const [userBalance, setUserBalance] = useState<UserBalance>();
  const { chains, chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (!currentToken || !signer) return;

    setUserBalance(undefined);
    getBalance(currentToken.address, signer).then(balance =>
      setUserBalance({
        value: balance,
        decimals: +currentToken.decimals,
        formatted: utils.formatting.formatToFourDecimals(
          ethers.utils.formatUnits(balance, currentToken.decimals)
        )
      })
    );
  }, [currentToken, signer]);

  const panelLoading = tokensLoading || !currentToken || !userBalance;

  const Image = utils.images.getConnectorIcon(account.connector?.name || "");
  if (!Image)
    throw new Error(
      `Could not find icon for connector ${account.connector?.name}`
    );

  return (
    <div className="mt-6 w-full shadow-lg lg:mx-4 lg:mt-0">
      {account.isConnected ? (
        <div className="flex w-full justify-between rounded-t-lg bg-indigo-600 p-6 text-white">
          <h2 className="w-full text-center text-3xl font-bold">Account</h2>
          <div className="flex flex-col items-center">
            <Listbox>
              {({ open }) => (
                <React.Fragment>
                  <Listbox.Button className="rounded-md bg-indigo-700 px-4 py-2 font-semibold">
                    {chain?.name || "Network"}
                  </Listbox.Button>
                  <Transition
                    show={open}
                    as={React.Fragment}
                    enter="transition ease-in duration-100"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute mt-12 mr-20 w-fit rounded-md bg-white p-2 font-semibold text-black shadow-xl">
                      {chains.map(chain => (
                        <p key={chain.id} className="whitespace-nowrap">
                          <button
                            onClick={() => switchNetwork?.(chain.id)}
                            className="w-full rounded-md py-2 px-6 hover:bg-gray-100"
                          >
                            {chain.name}
                          </button>
                        </p>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </React.Fragment>
              )}
            </Listbox>
          </div>
        </div>
      ) : (
        <h2 className="w-full rounded-t-lg bg-indigo-600 p-6 text-center text-3xl font-bold text-white">
          Account
        </h2>
      )}
      {account.isConnected ? (
        <div className="rounded-b-lg bg-white p-2">
          {panelLoading ? (
            <div className="flex w-full flex-col items-center py-10">
              <ClipLoader />
            </div>
          ) : (
            <div className="flex w-full flex-col items-center">
              <div className="w-full px-4 py-2">
                <span className="block text-xl font-bold">Wallet</span>
                <div className="flex w-full items-center gap-x-4">
                  <Image className="mx-4 my-6 scale-[2]" />
                  <div className="truncate text-ellipsis font-semibold">
                    {account.address}
                  </div>
                </div>
                <BaseButton
                  className="mr-4 w-full rounded-md border-2 border-black px-4 py-2 !font-bold text-black transition-colors duration-100 enabled:hover:bg-black enabled:hover:text-white"
                  baseStyleOverride
                  title="CHANGE"
                  onClick={openWalletModal}
                />
              </div>
              <div className="w-full px-4 py-2">
                <span className="mb-2 block text-xl font-bold">Token</span>
                <button
                  className="flex w-full items-center rounded-md border-2 border-black py-1 px-6 hover:bg-zinc-100"
                  onClick={openModal}
                >
                  <img
                    src={currentToken.src}
                    alt={`${currentToken.symbol} icon`}
                    className="mr-4 h-[2rem]"
                  />
                  <div className="flex flex-col items-start justify-start pt-2">
                    <span className="block text-lg font-semibold">
                      {currentToken.name}
                    </span>
                    <span className="relative bottom-2 block text-black/50">
                      {currentToken.symbol}
                    </span>
                  </div>
                </button>
              </div>
              <div className="w-full px-4 py-2">
                <span className="mb-2 block text-xl font-bold">Balance</span>
                <span className="block text-xl font-semibold">
                  {userBalance.formatted} {currentToken.symbol}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full rounded-b-lg bg-white py-6 px-6 text-center">
          <BaseButton title="Connect your Wallet" onClick={openWalletModal} />
        </div>
      )}
    </div>
  );
};