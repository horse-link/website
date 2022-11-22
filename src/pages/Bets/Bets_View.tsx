import { Button, PageLayout } from "../../components";
import { BetHistory } from "../../types";
import BetModal from "./components/BetModal";
import BetTable from "./components/BetTable";
import Select from "react-select";
import { paginationOptions } from "./Bets_Logic";
import Toggle from "../../components/Toggle";
import classnames from "classnames";
import { FilterOptions } from "./components/BetRows";

type Props = {
  myBetsEnabled: boolean;
  onMyBetToggle: () => void;
  onClickBet: (bet?: BetHistory) => void;
  isModalOpen: boolean;
  onCloseModal: () => void;
  selectedBet?: BetHistory;
  selectedFilter: FilterOptions;
  setSelectedFilter: (filter: FilterOptions) => void;
  setPagination: (pagination: number) => void;
  page: number;
  setPage: (page: number) => void;
  totalBetHistory: BetHistory[] | undefined;
  userBetHistory: BetHistory[] | undefined;
  userMaxPages: number;
  totalMaxPages: number;
};

const BetsView = ({
  onClickBet,
  isModalOpen,
  onCloseModal,
  myBetsEnabled,
  onMyBetToggle,
  selectedBet,
  selectedFilter,
  setSelectedFilter,
  setPagination,
  page,
  setPage,
  totalBetHistory,
  userBetHistory,
  userMaxPages,
  totalMaxPages
}: Props) => {
  return (
    <PageLayout requiresAuth={false}>
      <BetModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        betData={selectedBet}
      />

      <div className="w-full flex justify-between col-span-2 p-5">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          Bets History
        </h3>

        <div className="flex flex-row space-x-3">
          <Button
            className={classnames(
              "cursor-pointer bg-indigo-600 sm:w-auto sm:mb-0",
              {
                "bg-indigo-800 sm:w-auto sm:mb-0":
                  selectedFilter === FilterOptions.ALL_BETS
              },
              {
                "bg-indigo-600 sm:w-auto sm:mb-0": !selectedFilter
              }
            )}
            onClick={() => setSelectedFilter(FilterOptions.ALL_BETS)}
          >
            All Bets
          </Button>
          <Button
            className={classnames(
              "cursor-pointer bg-indigo-600 sm:w-auto sm:mb-0",
              {
                "bg-indigo-800 sm:w-auto sm:mb-0":
                  selectedFilter === FilterOptions.RESULTED
              },
              {
                "bbg-indigo-600 sm:w-auto sm:mb-0": !selectedFilter
              }
            )}
            onClick={() => setSelectedFilter(FilterOptions.RESULTED)}
          >
            Resulted
          </Button>
          <Button
            className={classnames(
              "cursor-pointer bg-indigo-600  sm:w-auto sm:mb-0",
              {
                "bg-indigo-800 sm:w-auto sm:mb-0":
                  selectedFilter === FilterOptions.PENDING
              },
              {
                "bg-indigo-600 sm:w-auto sm:mb-0": !selectedFilter
              }
            )}
            onClick={() => setSelectedFilter(FilterOptions.PENDING)}
          >
            Pending
          </Button>
          <Button
            className={classnames(
              "cursor-pointer bg-indigo-600 sm:w-auto sm:mb-0",
              {
                "bg-indigo-800 sm:w-auto sm:mb-0":
                  selectedFilter === FilterOptions.SETTLED
              },
              {
                "bg-indigo-600 sm:w-auto sm:mb-0": !selectedFilter
              }
            )}
            onClick={() => setSelectedFilter(FilterOptions.SETTLED)}
          >
            Settled
          </Button>
        </div>

        <div className="flex items-center">
          <Select
            onChange={selection => selection && setPagination(selection.value)}
            options={paginationOptions}
            defaultValue={paginationOptions[0]}
            isClearable={false}
            isSearchable={false}
            styles={{
              container: base => ({
                ...base,
                marginRight: "1rem"
              }),
              valueContainer: base => ({
                ...base,
                paddingLeft: "1rem",
                paddingRight: "1rem"
              }),
              indicatorSeparator: base => ({
                ...base,
                display: "none"
              })
            }}
          />
          <div className="flex gap-3 self-end justify-self-end items-center pb-2">
            <Toggle enabled={myBetsEnabled} onChange={onMyBetToggle} />
            <div className="font-semibold">My Bets</div>
          </div>
        </div>
      </div>
      <BetTable
        myBetsEnabled={myBetsEnabled}
        onClickBet={onClickBet}
        page={page}
        setPage={setPage}
        totalBetHistory={totalBetHistory}
        userBetHistory={userBetHistory}
        userMaxPages={userMaxPages}
        totalMaxPages={totalMaxPages}
        selectedFilter={selectedFilter}
      />
    </PageLayout>
  );
};

export default BetsView;
