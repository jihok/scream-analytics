import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useQuery } from '@apollo/client';
import Overview from '../src/components/Overview';
import { useGlobalContext } from '../src/contexts/GlobalContext';
import { YesterdayTodayMarketsQuery, YESTERDAY_TODAY_MARKETS_QUERY } from '../src/queries';
import Table from '../src/components/Table';
import { transformData } from '../src/utils/Market';
import { Details } from '../src/components/Table/Details';

const BLOCK_TIME = 1000; // we assume blocks are 1s
export const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

const Home: NextPage = () => {
  const { latestSyncedBlock } = useGlobalContext();
  console.log('yesterdayBlock: ', latestSyncedBlock - BLOCKS_IN_A_DAY);
  console.log('todayBlock: ', latestSyncedBlock);
  const { loading, error, data } = useQuery<YesterdayTodayMarketsQuery>(
    YESTERDAY_TODAY_MARKETS_QUERY,
    {
      variables: {
        yesterdayBlock: latestSyncedBlock - BLOCKS_IN_A_DAY,
        todayBlock: latestSyncedBlock,
      },
    }
  );

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
        <Overview yesterday={yesterday} today={today} />
        <Table yesterday={yesterday} today={today} />

        <Details asset={today[0]} />
      </main>
    </div>
  );
};

export default Home;
