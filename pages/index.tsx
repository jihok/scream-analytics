import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useQuery } from '@apollo/client';
import MarketsOverview from '../src/components/MarketsOverview';
import { useGlobalContext } from '../src/contexts/GlobalContext';
import { YesterdayTodayMarkets, YESTERDAY_TODAY_MARKETS_QUERY } from '../src/queries';
import AssetsTable from '../src/components/AssetsTable';
import { transformData } from '../src/utils/Market';

const BLOCK_TIME = 1000; // we assume blocks are 1s
const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

const Home: NextPage = () => {
  const { latestSyncedBlock } = useGlobalContext();
  const { loading, error, data } = useQuery<YesterdayTodayMarkets>(YESTERDAY_TODAY_MARKETS_QUERY, {
    variables: {
      yesterdayBlock: latestSyncedBlock - BLOCKS_IN_A_DAY,
      todayBlock: latestSyncedBlock,
    },
  });

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const yesterday = transformData(data.yesterday);
  const today = transformData(data.today);
  console.log(yesterday, today);
  return (
    <div className={styles.container}>
      <Head>
        <title>SCREAM Analytics</title>
        <meta name="description" content="SCREAM Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <MarketsOverview yesterday={yesterday} today={today} />
        <AssetsTable yesterday={yesterday} today={today} />
      </main>
    </div>
  );
};

export default Home;
