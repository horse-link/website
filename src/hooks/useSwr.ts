import swr from "swr";
import utils from "../utils";

const client = utils.general.getAxiosClient();
const fetcher = utils.general.getAxiosFetcher(client);

const useSwr = <T>(url: string, interval = 1000) => {
  const { data, error } = swr<T>(url, fetcher, {
    // refresh data every second
    refreshInterval: interval,
    // even when tab is closed
    refreshWhenHidden: true,
    // also attempt if connection drops
    refreshWhenOffline: true
  });

  return {
    data,
    isLoading: !error && !data,
    error
  };
};

export default useSwr;
