import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NextToJump } from "../../types/meets";
import utils from "../../utils";
import { Config } from "../../types/config";
import { getVenueFromConfig } from "../../utils/config";
import classnames from "classnames";

const INTERVAL = 1000;

type Props = {
  meet: NextToJump;
  config: Config;
};

export const DashboardBannerRow: React.FC<Props> = ({ meet, config }) => {
  const [timeString, setTimeString] = useState(
    utils.formatting.formatTimeToHMS(meet.jumperRaceStartTime)
  );
  const venueLocation = getVenueFromConfig(
    meet.meeting.jumperMeetingName,
    config
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeString(utils.formatting.formatTimeToHMS(meet.jumperRaceStartTime));
    }, INTERVAL);

    return () => clearInterval(interval);
  }, [meet]);

  return (
    <Link
      className={classnames(
        "w-full shrink-0 h-full lg:shrink flex flex-col text-center p-2",
        {
          "hover:bg-indigo-900": venueLocation,
          "cursor-default": !venueLocation
        }
      )}
      to={
        venueLocation ? `/horses/${venueLocation}/${meet.jumperRaceNumber}` : ""
      }
    >
      <span className="block">
        {`${meet.meeting.jumperMeetingName} (${meet.meeting.location}) - R${meet.jumperRaceNumber}`}
      </span>
      <span className="block font-semibold">{` ${timeString}`}</span>
    </Link>
  );
};
