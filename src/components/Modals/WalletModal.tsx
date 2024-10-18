import React from "react";
import { useConnect } from "wagmi";
import { BaseModal } from ".";
import utils from "../../utils";
import classNames from "classnames";

type Props = {
  isModalOpen: boolean;
  closeWalletModal: () => void;
  setLoading: (loading: boolean) => void;
};

export const WalletModal: React.FC<Props> = (props: Props) => {
  const { isModalOpen, closeWalletModal } = props;
  const { connect, connectors } = useConnect();
  // hours spent debugging "set state during render": 1
  // Warning: Cannot update a component (`PageLayout`) while rendering a different component (`WalletModal`). To locate the bad setState() call inside `WalletModal`,
  // setLoading(isLoading);
  // Changed to call when

  // TODO: Implement loading behaviour. useConnect() doesn't return isLoading anymore
  // useEffect(() => {
  //   setLoading(isLoading);
  // }, [isLoading]);

  const connectorsWithIcons = connectors.map(connector => ({
    connector,
    icon: utils.images.getConnectorIcon(connector.name)
  }));
  // TODO: make this have some cool handling when a decision is made on what the specified behaviour should be
  if (!connectorsWithIcons.length) console.error("No connectors");

  return (
    <BaseModal isOpen={isModalOpen} onClose={closeWalletModal}>
      <div className="text-center">
        {connectorsWithIcons.map(({ connector, icon }, index, array) => {
          // react components must be upper case :/
          const Icon = icon;
          const isLastElement = array.length - 1 === index;

          return (
            <React.Fragment key={connector.id}>
              <div className="w-full" key={connector.id}>
                <label
                  className="flex cursor-pointer justify-center"
                  onClick={e => {
                    e.preventDefault();
                    connect({ connector });
                    closeWalletModal();
                  }}
                >
                  {Icon ? (
                    <Icon
                      title={`${connector.name}-icon`}
                      className="h-20 w-20 opacity-100 transition-opacity duration-500 ease-out hover:opacity-40"
                    />
                  ) : (
                    connector.name.toUpperCase()
                  )}
                </label>
                <div className="font-bold">{connector.name.toUpperCase()}</div>
                <div>
                  Connect using your{" "}
                  {connector.name.toLowerCase().includes("walletconnect")
                    ? "mobile device"
                    : "browser"}
                  .
                </div>
              </div>

              <div
                className={classNames(
                  "mb-3 border-0 border-b border-solid py-4",
                  {
                    hidden: isLastElement
                  }
                )}
              />
            </React.Fragment>
          );
        })}
      </div>
    </BaseModal>
  );
};
