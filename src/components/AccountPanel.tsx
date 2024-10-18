import React, { useEffect, useState } from "react";
import { Chain, useAccount, useBalance, useNetwork, useSigner } from "wagmi";
import utils from "../utils";
import { ethers } from "ethers";
import { useBetSlipContext } from "../providers/BetSlip";
import { useWalletModal } from "../providers/WalletModal";
import { useERC20Contract } from "../hooks/contracts";
import { LS_PRIVATE_KEY } from "../hooks/useLocalWallet";
import { useConfig } from "../providers/Config";
import { useTokenContext } from "../providers/Token";
import { UserBalance } from "../types/users";
import constants from "../constants";
import { Card } from "./Card";
import { Button } from "./Buttons";
import { AiFillEyeInvisible, AiOutlineQrcode } from "react-icons/ai";
import { QrCodeModal } from "./Modals";
import { Listbox } from "@headlessui/react";
import { formatting } from "horselink-sdk";

type Props = {
  forceNewNetwork: (chain: Chain) => void;
  isLocalWallet: boolean;
};

export const AccountPanel: React.FC<Props> = ({
  forceNewNetwork,
  isLocalWallet
}) => {
  const { currentToken, openModal } = useTokenContext();
  const { hashes } = useBetSlipContext();

  const { openWalletModal } = useWalletModal();
  const account = useAccount();
  const config = useConfig();

  const { data: balanceData } = useBalance({
    address: account.address
  });
  const { data: signer } = useSigner();
  const { getBalance } = useERC20Contract();
  const [userBalance, setUserBalance] = useState<UserBalance>();
  const { chain, chains } = useNetwork();
  const [showQrCodeModal, setQrCodeModal] = useState(false);
  const closeQrCodeModal = () => setQrCodeModal(false);

  const [privateKey, setPrivateKey] = useState<string>();
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // get private key
  useEffect(() => {
    const localKey = localStorage.getItem(LS_PRIVATE_KEY);
    if (!localKey) return setPrivateKey(undefined);

    const decrypted = utils.general.decryptString(localKey, constants.env.SALT);
    setPrivateKey(decrypted);
  }, []);

  const togglePrivateKey = () => setShowPrivateKey(prev => !prev);

  useEffect(() => {
    //debugger;
    if (!currentToken || !signer) return;

    setUserBalance(undefined);
    getBalance(currentToken.address, signer).then(balance =>
      setUserBalance({
        value: balance,
        decimals: +currentToken.decimals,
        formatted: formatting.formatToFourDecimals(
          ethers.formatUnits(balance, currentToken.decimals)
        )
      })
    );
  }, [currentToken, signer, config, hashes]);

  return (
    <React.Fragment>
      <div className="flex w-full flex-col gap-y-6">
        <Card
          title="Token"
          data={
            <button
              className="flex w-full items-center border border-hl-border py-3 px-4 font-sans"
              onClick={openModal}
            >
              <img
                src={currentToken?.src || "/images/horse.webp"}
                alt="HorseLink logo"
                className="max-w-[2rem]"
              />
              <div className="w-full text-center text-base font-normal">
                {currentToken?.name || "Token"}
              </div>
            </button>
          }
        />
        <Card
          title={`${currentToken ? currentToken.symbol : "Token"} Balance`}
          data={
            userBalance && currentToken
              ? `${userBalance.formatted} ${currentToken.symbol}`
              : undefined
          }
        />
        <Card
          title={`${chain?.name || ""} Balance`}
          data={
            balanceData
              ? `${(+balanceData.formatted).toFixed(4)} ETH`
              : undefined
          }
        />
        <Card
          title="Network"
          data={
            <Listbox as={React.Fragment}>
              {({}) => (
                <React.Fragment>
                  <Listbox.Button className="w-full w-full border border-hl-secondary bg-hl-secondary py-2 font-sans text-sm text-hl-background 3xl:text-base">
                    {chain?.name || "Please connect"}
                  </Listbox.Button>
                  <Listbox.Options className="pt-2 font-sans text-base font-normal">
                    {[
                      ...chains.filter(c => (chain ? c.id !== chain.id : true))
                    ].map(chain => (
                      <Listbox.Option key={chain.id} value={chain.id}>
                        <button
                          onClick={() => forceNewNetwork(chain)}
                          className="w-full border border-hl-primary py-2 text-center hover:bg-hl-primary hover:text-hl-secondary"
                        >
                          {chain.name}
                        </button>
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </React.Fragment>
              )}
            </Listbox>
          }
        />
        <Card
          title="Account"
          data={
            <div className="w-full font-sans text-base font-normal">
              <div className="mb-2 flex w-full items-center justify-between">
                <h3 className="flex items-center gap-x-2">
                  WALLET ADDRESS
                  {isLocalWallet && (
                    <button onClick={() => setQrCodeModal(true)}>
                      <AiOutlineQrcode className="mr-2 h-[2rem] w-[2rem]" />
                    </button>
                  )}
                </h3>
                <Button
                  text="COPY"
                  onClick={() =>
                    navigator.clipboard.writeText(account.address || "")
                  }
                />
              </div>
              <p className="mb-6 truncate border border-hl-border p-2">
                {account.address}
              </p>
              {isLocalWallet && (
                <React.Fragment>
                  <div className="mb-2 flex w-full items-center justify-between">
                    <h3>PRIVATE KEY</h3>
                    <Button
                      text="COPY"
                      onClick={() =>
                        navigator.clipboard.writeText(privateKey || "")
                      }
                    />
                  </div>
                  <button
                    className="mb-6 w-full truncate border border-hl-border p-2"
                    onClick={togglePrivateKey}
                  >
                    {showPrivateKey ? (
                      privateKey
                    ) : (
                      <div className="flex w-full justify-center">
                        <AiFillEyeInvisible size={20} />
                      </div>
                    )}
                  </button>
                </React.Fragment>
              )}
              <div className="w-full font-black">
                <Button big text="change wallet" onClick={openWalletModal} />
              </div>
            </div>
          }
        />
      </div>
      <QrCodeModal showModal={showQrCodeModal} onClose={closeQrCodeModal} />
    </React.Fragment>
  );
};
