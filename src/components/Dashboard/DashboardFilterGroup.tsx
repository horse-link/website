import React from "react";
import classNames from "classnames";
import { MeetFilters } from "../../types/meets";

const options: Map<MeetFilters, string> = new Map([
  ["ALL", "All"],
  ["AUS_NZ", "AUS & NZ"],
  ["INTERNATIONAL", "International"]
]);

type Props = {
  value: MeetFilters;
  onChange: (option: MeetFilters) => void;
  disabled: boolean;
};

export const DashboardFilterGroup: React.FC<Props> = ({
  value: currentOption,
  onChange,
  disabled
}) => (
  <React.Fragment>
    {[...options].map(([key, text]) => (
      <button
        key={key}
        onClick={() => {
          onChange(key);
        }}
        className={classNames(
          "bg-white rounded w-full md:w-28 text-sm md:text-base",
          {
            "bg-indigo-600 text-white hover:bg-indigo-700":
              key === currentOption,
            "disabled:opacity-75 hover:bg-gray-200": key !== currentOption
          }
        )}
        disabled={disabled}
      >
        {text}
      </button>
    ))}
  </React.Fragment>
);
