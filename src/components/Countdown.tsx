import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import classNames from "classnames";
import { getDurationSplits } from "../utils/time";
import { ONE_SECOND_MS } from "../constants/time";

type Props = {
  large?: boolean;
  containerStyles?: string;
  setIsBefore: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Countdown: React.FC<Props> = ({
  large,
  containerStyles,
  setIsBefore
}) => {
  //FIRST NEED TO DEFINE NOW VIA TIMESTAMP
  const [now, setNow] = useState(Date.now());

  // will be either 0 or a timestamp, if 0 we want to return null in our return statement
  const eventTimestamp = +(process.env.VITE_EVENT_TS || "0");

  //time until event in seconds
  const timeUntilEvent = dayjs.unix(eventTimestamp).diff(now, "seconds");

  //time split into days, hours, minutes, time
  const { days, hours, minutes, seconds } = getDurationSplits(timeUntilEvent);

  // countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      setIsBefore(dayjs(Date.now()).isBefore(dayjs.unix(eventTimestamp)));
    }, 1 * ONE_SECOND_MS);

    // cleanup
    return () => clearInterval(interval);
  }, []);
  return !eventTimestamp ? null : (
    <div
      className={classNames(
        "mt-8 flex w-full flex-col items-center justify-center",
        {
          [containerStyles!]: !!containerStyles
        }
      )}
    >
      <p
        className={classNames("text-xl font-bold", {
          "mb-4 text-xl": !large,
          "mb-8 text-xl lg:text-7xl": large
        })}
      >
        Tournament Jumps In:
      </p>
      <div className="grid grid-cols-2 grid-rows-2 gap-6 lg:flex">
        <div className="rounded-md bg-white p-6 text-center text-xl font-bold">
          <p>{days}</p>
          <p>days</p>
        </div>
        <div className="rounded-md bg-white p-6 text-center text-xl font-bold">
          <p>{hours}</p>
          <p>hours</p>
        </div>
        <div className="rounded-md bg-white p-6 text-center text-xl font-bold">
          <p>{minutes}</p>
          <p>minutes</p>
        </div>
        <div className="rounded-md bg-white p-6 text-center text-xl font-bold">
          <p>{seconds}</p>
          <p>seconds</p>
        </div>
      </div>
    </div>
  );
};
