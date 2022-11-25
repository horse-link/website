import { shortenAddress } from "../../utils/formatting";
import { TxType } from "../../pages/VaultList/components/Vault/Vault_Logic";

type Props = {
  hash?: string;
  isSuccess: boolean;
  errorMsg?: string;
  txType?: TxType;
};
const ContractWriteResultCard = ({
  hash,
  isSuccess,
  errorMsg,
  txType
}: Props) => {
  return (
    <>
      {isSuccess && hash && (
        <div className="py-5 rounded-md shadow  bg-emerald-300 text-emerald-800 w-full text-center">
          <p className="p-1">Success! Your {txType} has been confirmed.</p>

          <a
            href={`${process.env.VITE_SCANNER_URL}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Transaction Hash: {shortenAddress(hash)}
          </a>
        </div>
      )}
      {errorMsg && (
        <div className="px-10 py-5 rounded-md shadow  bg-red-300  text-red-800 break-words">
          Error <br />
          {errorMsg}
        </div>
      )}
    </>
  );
};

export default ContractWriteResultCard;
