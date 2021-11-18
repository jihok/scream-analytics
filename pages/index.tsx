import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from '@apollo/client';
import { BigNumber } from 'ethers';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import MarketsOverview from '../src/components/MarketsOverview';
import { useGlobalContext } from '../src/contexts/GlobalContext';
import { YESTERDAY_TODAY_MARKET_QUERY } from '../src/queries';

interface QueryData {
  markets: Array<{
    totalSupply: string; // in tokens
    totalBorrows: string; // in tokens
    cash: string; // LIQUIDITY
    id: string;
    symbol: string;
    underlyingPrice: string;
    underlyingSymbol: string;
    exchangeRate: string;
  }>;
  _meta: {
    block: {
      number: number;
    };
  };
}

const BLOCK_TIME = 1000; // we assume blocks are 1s
const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

const QUERY = gql`
  query {
    markets {
      totalSupply
      totalBorrows
      cash
      id
      symbol
      underlyingPrice
      underlyingSymbol
      exchangeRate
    }
    _meta {
      block {
        number
      }
    }
  }
`;

const Home: NextPage = () => {
  const { latestSyncedBlock } = useGlobalContext();
  const { loading, error, data } = useQuery<QueryData>(
    YESTERDAY_TODAY_MARKET_QUERY
  );

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const { yesterday, today } = data;
  console.log(data);
  console.log(
    data._meta.block.number,
    data._meta.block.number - BLOCKS_IN_A_DAY
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>SCREAM Analytics</title>
        <meta name="description" content="SCREAM Analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <MarketsOverview
          currentMarkets={data.markets}
          currentBlock={data._meta.block.number}
        />
      </main>
    </div>
  );
};

export default Home;
