import React from "react";
import { BetHistory } from "../../../types";
import { Row } from "./BetTable";

export type FilterOption = "ALL_BETS" | "RESULTED" | "PENDING" | "SETTLED";

enum FilterOptions {
  ALL_BETS = "ALL_BETS",
  RESULTED = "RESULTED",
  PENDING = "PENDING",
  SETTLED = "SETTLED"
}

type Props = {
  bets?: BetHistory[];
  onClickBet: (bet?: BetHistory) => void;
  selectedFilter: string;
};

const BetRows: React.FC<Props> = ({ bets, onClickBet, selectedFilter }) => {
  if (!bets) return <td className="p-2 select-none">loading...</td>;
  return (
    <React.Fragment>
      {bets.length === 0 ? (
        <td className="p-2 select-none">no bets</td>
      ) : (
        bets.map((bet, index) => {
          if (
            selectedFilter === FilterOptions.RESULTED &&
            (bet.winningPropositionId || bet.marketResultAdded) &&
            !bet.settled
          ) {
            return (
              <Row betData={bet} key={bet.tx} onClick={() => onClickBet(bet)} />
            );
          } else if (
            selectedFilter === FilterOptions.PENDING &&
            !bet.winningPropositionId &&
            !bet.marketResultAdded &&
            !bet.settled
          ) {
            return (
              <Row betData={bet} key={index} onClick={() => onClickBet(bet)} />
            );
          } else if (selectedFilter === FilterOptions.SETTLED && bet.settled) {
            return (
              <Row betData={bet} key={index} onClick={() => onClickBet(bet)} />
            );
          }
          return (
            <Row betData={bet} key={index} onClick={() => onClickBet(bet)} />
          );
        })
      )}
    </React.Fragment>
  );
};

export default BetRows;
