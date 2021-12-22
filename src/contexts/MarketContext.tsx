import React, { createContext, useContext, useEffect, useState } from 'react';
import { screamClient } from '../../pages/_app';
import { MARKETS_BY_BLOCK_QUERY } from '../queries';
import { Market, RawMarket, transformMarketData } from '../utils/Market';
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

      setYesterdayMarkets(transformMarketData(yesterday.data.markets));
      setTodayMarkets(
        transformMarketData(
          today.data.markets.filter(
            (market) => market.id !== '0x383d965c8d2ac0a9c1f6930ad10943606bca4cb7' // filter out fake FRAX
          )
        )
      );
    })();
  }, [latestSyncedBlock]);

  return (
    <MarketContext.Provider value={{ yesterdayMarkets, todayMarkets }}>
      {!todayMarkets.length || !yesterdayMarkets.length ? (
        <div>{/** TODO: LOADING */}</div>
      ) : (
        props.children
      )}
    </MarketContext.Provider>
  );
}

export const useMarketContext = () => {
  return useContext(MarketContext);
};
