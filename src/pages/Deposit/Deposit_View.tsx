import { PageLayout } from "../../components";
import ContractWriteResultCard from "../../components/ContractWriteResultCard/ContractWriteResultCard_View";
import RequireWalletButton from "../../components/RequireWalletButton/RequireWalletButton_View";

type Props = {
  symbol: string;
  depositAmount: number;
  updateDepositAmount: (amount: number) => void;
  shouldDepositButtonDisabled: boolean;
  contract: {
    depositContractWrite?: () => void;
    approveContractWrite?: () => void;
    errorMsg?: string;
  };
  txStatus: {
    isLoading: boolean;
    isSuccess: boolean;
    hash?: string;
  };
  isEnoughAllowance: boolean;
};
const DepositView = ({
  symbol,
  depositAmount,
  updateDepositAmount,
  shouldDepositButtonDisabled,
  contract,
  txStatus,
  isEnoughAllowance
}: Props) => {
  return (
    <PageLayout requiresAuth={false}>
      <div className="grid place-content-center">
        <div className="w-96 px-10 pt-5 pb-3 rounded-md shadow border-b bg-white border-gray-200">
          <h1 className="text-3xl">Deposit {symbol}</h1>
          <form className="mt-5">
            <label>
              <span>Amount</span>
              <input
                type="number"
                onChange={e => {
                  updateDepositAmount(e.target.valueAsNumber || 0);
                }}
                value={depositAmount || ""}
                placeholder="0.0"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </label>
            <div className="flex justify-end mt-12">
              <RequireWalletButton
                actionButton={
                  isEnoughAllowance ? (
                    <button
                      className="px-5 py-1 hover:bg-gray-100 rounded-md border border-gray-500 shadow-md"
                      onClick={contract.depositContractWrite}
                      disabled={shouldDepositButtonDisabled}
                    >
                      {txStatus.isLoading ? "Backing..." : "Deposit"}
                    </button>
                  ) : (
                    <button
                      className="px-5 py-1 hover:bg-gray-100 rounded-md border border-gray-500 shadow-md "
                      onClick={contract.approveContractWrite}
                    >
                      {txStatus.isLoading ? "Approving funds..." : "Approve"}
                    </button>
                  )
                }
              />
            </div>
          </form>
        </div>
        <ContractWriteResultCard
          hash={txStatus.hash}
          isSuccess={txStatus.isSuccess}
          errorMsg={contract.errorMsg}
        />
      </div>
    </PageLayout>
  );
};

export default DepositView;
