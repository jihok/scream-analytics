import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Overview from '../src/components/Overview';
import Table from '../src/components/Table';
import { useMarketContext } from '../src/contexts/MarketContext';

const Home: NextPage = () => {
  const { yesterdayMarkets, todayMarkets } = useMarketContext();
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
      </main>
    </div>
  );
};

export default Home;
