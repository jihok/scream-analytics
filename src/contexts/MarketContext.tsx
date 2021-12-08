import React, { createContext, useContext, useEffect, useState } from 'react';
import { screamClient } from '../../pages/_app';
import { MARKETS_BY_BLOCK_QUERY } from '../queries';
import { Market, RawMarket, transformData } from '../utils/Market';
import { useGlobalContext } from './GlobalContext';

interface MarketContext {
  yesterdayMarkets: Market[];
  todayMarkets: Market[];
}

const MarketContext = createContext<MarketContext>({ yesterdayMarkets: [], todayMarkets: [] });

const BLOCK_TIME = 1000; // we assume blocks are 1s
export const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

export default function MarketProvider(props: { children: React.ReactNode }) {
  const { latestSyncedBlock } = useGlobalContext();
  const [yesterdayMarkets, setYesterdayMarkets] = useState<Market[]>([]);
  const [todayMarkets, setTodayMarkets] = useState<Market[]>([]);

  useEffect(() => {
    (async () => {
      const [yesterday, today] = await Promise.all([
        screamClient.query<{ markets: RawMarket[] }>({
          query: MARKETS_BY_BLOCK_QUERY,
          variables: {
            blockNumber: latestSyncedBlock - BLOCKS_IN_A_DAY,
          },
        }),
        screamClient.query<{ markets: RawMarket[] }>({
          query: MARKETS_BY_BLOCK_QUERY,
          variables: {
            blockNumber: latestSyncedBlock,
          },
        }),
      ]);

      setYesterdayMarkets(transformData(yesterday.data.markets));
      setTodayMarkets(transformData(today.data.markets));
    })();
  }, [latestSyncedBlock]);

  return (
    <MarketContext.Provider value={{ yesterdayMarkets, todayMarkets }}>
      {props.children}
    </MarketContext.Provider>
  );
}

export const useMarketContext = () => {
  return useContext(MarketContext);
};
