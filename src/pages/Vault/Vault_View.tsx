import { PageLayout } from "../../components";
import ContractWriteResultCard from "../../components/ContractWriteResultCard/ContractWriteResultCard_View";
import RequireWalletButton from "../../components/RequireWalletButton/RequireWalletButton_View";
import { VaultDetail, VaultDetailProps } from "./Component/VaultDetail";

type Props = {
  vaultDetailData: VaultDetailProps;
  userBalance: number;
  depositAmount: number;
  updateDepositAmount: (amount: number) => void;
  shouldDepositButtonDisabled: boolean;
  shouldWithdrawButtonDisabled: boolean;
  contract: {
    depositContractWrite?: () => void;
    approveContractWrite?: () => void;
    withdrawContractWrite?: () => void;
    errorMsg?: string;
  };
  txStatus: {
    isLoading: boolean;
    isSuccess: boolean;
    hash?: string;
  };
  isEnoughAllowance: boolean;
};
const VaultView = ({
  vaultDetailData,
  userBalance,
  depositAmount,
  updateDepositAmount,
  shouldDepositButtonDisabled,
  shouldWithdrawButtonDisabled,
  contract,
  txStatus,
  isEnoughAllowance
}: Props) => {
  return (
    <PageLayout requiresAuth={false}>
      <div className="grid place-content-center justify-items-center">
        <div className="max-w-lx">
          <div className="flex flex-col flex-row justify-between px-3 py-3 rounded-md shadow border-b bg-white border-gray-200">
            <div>
              <VaultDetail {...vaultDetailData} />
            </div>
            <div>
              <div className="p-3 mt-5 rounded-md shadow border border-gray-200">
                <h1 className="text-3xl mb-2">Deposit / Withdraw</h1>
                <span>Shares : {userBalance}</span>
                <form>
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
                  <div className="flex mt-5">
                    <RequireWalletButton
                      actionButton={
                        isEnoughAllowance ? (
                          <div className="grid grid-flow-row auto-rows-max">
                            <button
                              className={
                                "px-5 py-1 hover:bg-gray-100 rounded-md border border-gray-500 shadow-md" +
                                (shouldDepositButtonDisabled
                                  ? " opacity-50 cursor-not-allowed"
                                  : "")
                              }
                              onClick={contract.depositContractWrite}
                              disabled={shouldDepositButtonDisabled}
                            >
                              {txStatus.isLoading ? "..." : "Deposit"}
                            </button>
                            <button
                              className={
                                "px-5 py-1 mt-2 hover:bg-gray-100 rounded-md border border-gray-500 shadow-md" +
                                (shouldWithdrawButtonDisabled
                                  ? " opacity-50 cursor-not-allowed"
                                  : "")
                              }
                              onClick={contract.withdrawContractWrite}
                              disabled={shouldWithdrawButtonDisabled}
                            >
                              {txStatus.isLoading ? "..." : "Withdraw"}
                            </button>
                          </div>
                        ) : (
                          <button
                            className="px-5 py-1 hover:bg-gray-100 rounded-md border border-gray-500 shadow-md "
                            onClick={contract.approveContractWrite}
                          >
                            {txStatus.isLoading ? "..." : "Approve"}
                          </button>
                        )
                      }
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <ContractWriteResultCard
              hash={txStatus.hash}
              isSuccess={txStatus.isSuccess}
              errorMsg={contract.errorMsg}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VaultView;
