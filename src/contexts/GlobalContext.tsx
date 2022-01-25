import { useQuery } from '@apollo/client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { screamClient } from '../../pages/_app';
import Loading from '../components/Loading';
import { LatestBlockQuery, LATEST_BLOCK_QUERY, MARKETS_BY_BLOCK_QUERY } from '../queries';
import { getScreamPrice } from '../utils';
import { Market, RawMarket, transformMarketData } from '../utils/Market';

interface GlobalContext {
  latestSyncedBlock: number;
  screamPrice: number;
  yesterdayMarkets: Market[];
  todayMarkets: Market[];
  showLoading: boolean;
  setShowLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<GlobalContext>({
  latestSyncedBlock: 0,
  screamPrice: 0,
  yesterdayMarkets: [],
  todayMarkets: [],
  showLoading: true,
  setShowLoading: () => {},
});

const BLOCK_TIME = 1000; // we assume blocks are 1s
export const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

export default function GlobalProvider(props: { children: React.ReactNode }) {
  const { loading, error, data } = useQuery<LatestBlockQuery>(LATEST_BLOCK_QUERY);
  const [screamPrice, setScreamPrice] = useState(0);
  const [yesterdayMarkets, setYesterdayMarkets] = useState<Market[]>([]);
  const [todayMarkets, setTodayMarkets] = useState<Market[]>([]);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const fetchScreamPrice = async () => {
      setScreamPrice(await getScreamPrice());
    };
    fetchScreamPrice();
  }, []);

  useEffect(() => {
    setShowLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (data) {
      (async () => {
        const [yesterday, today] = await Promise.all([
          screamClient.query<{ markets: RawMarket[] }>({
            query: MARKETS_BY_BLOCK_QUERY,
            variables: {
              blockNumber: data._meta.block.number - BLOCKS_IN_A_DAY,
            },
          }),
          screamClient.query<{ markets: RawMarket[] }>({
            query: MARKETS_BY_BLOCK_QUERY,
            variables: {
              blockNumber: data._meta.block.number,
            },
          }),
        ]);

        setYesterdayMarkets(transformMarketData(yesterday.data.markets));
        setTodayMarkets(
          transformMarketData(
            today.data.markets.filter(
              (market) => market.id !== '0x383d965c8d2ac0a9c1f6930ad10943606bca4cb7' // filter out fake FRAX
            )
          )
        );
      })();
    }
  }, [data]);

  if (loading) return <Loading />;
  if (error) return <p>Error :( - global</p>;

  return (
    <GlobalContext.Provider
      value={{
        latestSyncedBlock: data?._meta.block.number ?? 0,
        screamPrice,
        yesterdayMarkets,
        todayMarkets,
        showLoading,
        setShowLoading,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
