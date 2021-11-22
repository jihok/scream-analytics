import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Overview from '../src/components/Overview';
import { useGlobalContext } from '../src/contexts/GlobalContext';
import { MARKETS_BY_BLOCK_QUERY } from '../src/queries';
import Table from '../src/components/Table';
import { Market, RawMarket, transformData } from '../src/utils/Market';
import { Details } from '../src/components/Table/Details';
import { useEffect, useState } from 'react';
import { screamClient } from './_app';

const BLOCK_TIME = 1000; // we assume blocks are 1s
export const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

const Home: NextPage = () => {
  const { latestSyncedBlock } = useGlobalContext();
  const [yesterdayMarkets, setYesterdayMarkets] = useState<Market[]>();
  const [todayMarkets, setTodayMarkets] = useState<Market[]>();

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

  if (!yesterdayMarkets || !todayMarkets) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <Head>
        <title>SCREAM Analytics</title>
        <meta name="description" content="SCREAM Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Overview yesterday={yesterdayMarkets} today={todayMarkets} />
        <Table yesterday={yesterdayMarkets} today={todayMarkets} />

        <Details asset={todayMarkets[0]} />
      </main>
    </div>
  );
};

export default Home;
