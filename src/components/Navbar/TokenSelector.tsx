import React from "react";
import { TokenSelectorButton } from "../Buttons";

export const TokenSelector: React.FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center text-black">
      <TokenSelectorButton />
    </div>
  );
};
