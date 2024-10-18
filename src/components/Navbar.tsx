import React from "react";
import classNames from "classnames";
import { Link, useLocation } from "react-router-dom";
import { NavbarRouting } from "../Routing";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";

export const Navbar: React.FC = () => {
  const { pathname } = useLocation();
  const currentPath = pathname.split("/", 2).join("/");

  const { chain } = useAccount();
  const isTestnet = chain?.id === sepolia.id;

  const Routes = NavbarRouting.filter(r => {
    if (!isTestnet) {
      const withoutLeaderboard = !r.path.includes("leaderboard");
      const withoutFaucet = !r.path.includes("faucet");

      return withoutLeaderboard && withoutFaucet;
    }

    return true;
  });

  return (
    <div className="flex w-full items-center gap-x-20 bg-hl-background-secondary px-10 py-6 text-hl-tertiary">
      <h2 className="font-basement text-3xl font-black text-hl-primary">
        <span className="text-hl-secondary">HORSE</span>LINK
      </h2>
      {Routes.map(r => (
        <Link
          key={r.path}
          to={r.path}
          className={classNames("text-sm", {
            "underline decoration-hl-secondary underline-offset-4":
              r.path === currentPath
          })}
        >
          {r.name.toUpperCase()}
        </Link>
      ))}
    </div>
  );
};
