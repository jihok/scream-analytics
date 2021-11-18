import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useQuery } from '@apollo/client';
import MarketsOverview from '../src/components/MarketsOverview';
import { useGlobalContext } from '../src/contexts/GlobalContext';
import { YesterdayTodayMarketsQuery, YESTERDAY_TODAY_MARKET_QUERY } from '../src/queries';

const BLOCK_TIME = 1000; // we assume blocks are 1s
const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

const Home: NextPage = () => {
  const { latestSyncedBlock } = useGlobalContext();
  const { loading, error, data } = useQuery<YesterdayTodayMarketsQuery>(
    YESTERDAY_TODAY_MARKET_QUERY,
    {
      variables: {
        yesterdayBlock: latestSyncedBlock - BLOCKS_IN_A_DAY,
        todayBlock: latestSyncedBlock,
      },
    }
  );

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const { yesterday, today } = data;
  console.log(yesterday, today);
  return (
    <div className={styles.container}>
      <Head>
        <title>SCREAM Analytics</title>
        <meta name="description" content="SCREAM Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* <MarketsOverview currentMarkets={data.markets} currentBlock={data._meta.block.number} /> */}
      </main>
    </div>
  );
};

export default Home;
