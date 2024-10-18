import { formatting } from "horselink-sdk";
import classNames from "classnames";
import { useScannerUrl } from "../hooks/useScannerUrl";
import { Address } from "viem";

type Props = {
  address: Address;
  isTruncated?: boolean;
  className?: string;
};

export const AddressLink: React.FC<Props> = ({
  address,
  isTruncated,
  className
}) => {
  const scanner = useScannerUrl();

  return (
    <a
      href={`${scanner}/address/${address}`}
      target="_blank"
      rel="noreferrer noopener"
      className={classNames({
        hyperlink: !className,
        [className!]: !!className
      })}
    >
      {isTruncated ? formatting.shortenAddress(address) : address}
    </a>
  );
};
