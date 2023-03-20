import React from "react";
import { BaseModal } from ".";
import utils from "../../utils";
import { useScannerUrl } from "../../hooks/useScannerUrl";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  hashes?: string[];
};

export const SettledMarketModal: React.FC<Props> = ({
  isOpen,
  onClose,
  hashes
}) => {
  const scanner = useScannerUrl();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-2xl font-bold">Settled Race</h2>
      <h3 className="mt-4 font-semibold">Transactions:</h3>
      <ol className="ml-4 list-decimal">
        {hashes?.map(hash => (
          <li key={hash}>
            <a
              href={`${scanner}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hyperlink underline underline-offset-2"
            >
              {utils.formatting.shortenHash(hash)}
            </a>
          </li>
        ))}
      </ol>
    </BaseModal>
  );
};
