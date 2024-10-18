import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { BetSlipContextType, BetSlipEntry, BetEntry } from "../types/context";
import { useMarketContract } from "../hooks/contracts";
import { useConfig } from "./Config";
import dayjs from "dayjs";
import isYesterday from "dayjs/plugin/isYesterday";
import { BetSlipTxModal } from "../components/Modals";
import { Signer } from "ethers";
import utils from "../utils";

dayjs.extend(isYesterday);

const LOCAL_STORAGE_KEY = "horse.link-bet-slip";

export const BetSlipContext = createContext<BetSlipContextType>({
  addBet: () => {},
  addBets: () => {},
  clearBets: () => {},
  forceNewSigner: () => {},
  placeBetImmediately: async () => {},
  placeBetsInBetSlip: () => {},
  removeBet: () => {},
  txLoading: false
});

export const useBetSlipContext = () => useContext(BetSlipContext);

export const BetSlipContextProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const { placeBet, placeMultipleBets } = useMarketContract();
  const config = useConfig();

  const [signer, setSigner] = useState<Signer>();
  const [bets, setBets] = useState<BetSlipEntry[]>();
  const [txLoading, setTxLoading] = useState(false);
  const [hashes, setHashes] = useState<string[]>();
  const [errors, setErrors] = useState<string[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // force new signer
  const forceNewSigner = (signer: Signer) => {
    setSigner(signer);
  };

  // load bets on page load
  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw || raw === "undefined") return;

    const parsed = JSON.parse(raw);
    // parse the date which will be the start of the day that the bet slip was created
    const parsedDate = dayjs(parsed.date).valueOf();

    // get the timestamp for 00:00 today
    const startOfToday = dayjs().startOf("day").valueOf();

    // if the date of the betslip is before today (i.e. yesterday or before) then clear the slip and cache
    if (dayjs(parsedDate).isBefore(startOfToday)) {
      setBets(undefined);
      return localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    setBets(parsed.data);
  }, []);

  // write bet slip to local storage if bets exist
  useEffect(() => {
    if (bets && bets.length)
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          data: bets,
          // only log the day
          date: dayjs().startOf("day").valueOf()
        })
      );
  }, [bets]);

  const addBet = useCallback(
    (bet: BetEntry) => {
      // if there are no bets, set the bets state to the new bet, id 0
      if (!bets?.length)
        return setBets([
          {
            ...bet,
            id: 0,
            timestamp: Math.floor(Date.now() / 1000)
          }
        ]);

      // create a new reference to bets and add timestamp
      const oldBets = [...bets];
      // and append the new bet, id is the index
      setBets(
        [...oldBets, bet].map((bet, i) => ({
          ...bet,
          id: i
        }))
      );
    },
    [bets]
  );

  const addBets = useCallback(
    (bet: BetEntry[]) => {
      // if there are no bets, set the bets state to the new bet, id 0
      if (!bets?.length) {
        bet.forEach(b => {
          setBets([
            {
              ...b,
              id: 0,
              timestamp: Math.floor(Date.now() / 1000)
            }
          ]);
        });

        return;
      }

      // create a new reference to bets and add timestamp
      const oldBets = [...bets];

      // and append the new bet, id is the index
      bet.forEach(b => {
        setBets(
          [...oldBets, b].map((bet, i) => ({
            ...bet,
            id: i
          }))
        );
      });
    },
    [bets]
  );

  const clearBets = useCallback(() => {
    setBets(undefined);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, [bets]);

  const removeBet = useCallback(
    (id: number) => {
      // if there are no bets do nothing
      if (!bets?.length) return;

      // create a new reference to bets and filter it
      const newBets = [...bets].filter(bet => bet.id !== id);

      // if the new bets has no length, set undefined
      if (!newBets.length) return clearBets();

      // set the bets
      setBets(
        newBets.map((bet, i) => ({
          ...bet,
          id: i
        }))
      );
    },
    [bets]
  );

  const placeBetsInBetSlip = useCallback(async () => {
    if (!bets?.length || !signer || !config) return;

    // reset state
    setTxLoading(true);
    setHashes(undefined);
    setErrors(undefined);

    // place bets
    const raw = await Promise.allSettled([
      ...(await placeMultipleBets(
        signer,
        bets.map(bet => ({
          market: bet.market,
          back: bet.back,
          wager: bet.wager
        }))
      ))
    ]);

    const txs = raw.filter(utils.types.isFulfilled).map(r => r.value);
    const errors = raw
      .filter(utils.types.isRejected)
      .map(r => r.reason as string);

    // set errors
    setErrors(errors);

    // set hashes
    setHashes(txs);
    clearBets();

    // stop loading
    setTxLoading(false);

    // open modal
    setIsModalOpen(true);
  }, [config, bets, signer, placeBet]);

  const placeBetImmediately = useCallback(
    async (bet: BetEntry) => {
      if (!bet || !signer || !config) return;

      // reset state
      setTxLoading(true);
      setHashes(undefined);
      setErrors(undefined);

      // open modal
      setIsModalOpen(true);

      // place bet
      let tx,
        error: string | undefined = undefined;
      try {
        tx = await placeBet(bet.market, bet.back, bet.wager, signer);
      } catch (err: any) {
        console.error(err);
        error = err as string;
      }

      // set error
      setErrors(error ? [error] : undefined);

      // set hash
      setHashes(tx ? [tx] : undefined);

      // stop loading
      setTxLoading(false);
    },
    [config, signer, placeBet]
  );

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const value = useMemo(
    () => ({
      txLoading,
      hashes,
      bets,
      errors,
      addBet,
      addBets,
      removeBet,
      clearBets,
      placeBetsInBetSlip,
      placeBetImmediately,
      forceNewSigner
    }),
    [
      txLoading,
      hashes,
      bets,
      errors,
      addBet,
      addBets,
      removeBet,
      clearBets,
      placeBetsInBetSlip,
      placeBetImmediately,
      forceNewSigner
    ]
  );

  return (
    <BetSlipContext.Provider value={value}>
      {children}
      <BetSlipTxModal isOpen={isModalOpen} onClose={closeModal} />
    </BetSlipContext.Provider>
  );
};
