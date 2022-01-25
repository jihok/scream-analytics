import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/dist/client/router';
import Layout from '../../src/components/Layout';
import UtilizationChart from '../../src/components/Market/UtilizationChart';
import { useGlobalContext, BLOCKS_IN_A_DAY } from '../../src/contexts/GlobalContext';
import { MARKET_BASE_BY_BLOCK_QUERY, MARKET_DETAILS_QUERY } from '../../src/queries';
import {
  Market,
  MarketDetails,
  RawMarket,
  RawMarketDetails,
  transformMarketData,
} from '../../src/utils/Market';
import { screamClient } from '../_app';
import MarketHeader from '../../src/components/Market/Header';
import MarketState from '../../src/components/Market/State';
import Loading from '../../src/components/Loading';

/**
 * props passed down to the child components of this page
 */
export interface MarketPageProps {
  yesterday: Market;
  market: MarketDetails;
}

export default function MarketPage() {
  const { latestSyncedBlock, yesterdayMarkets } = useGlobalContext();

  const {
    query: { id },
  } = useRouter();
  const { loading, error, data } = useQuery<{ markets: RawMarketDetails[] }>(MARKET_DETAILS_QUERY, {
    variables: { id },
  });
  const [historicalData, setHistoricalData] = useState<Market[]>([]);
  const [daysToFetch, setDaysToFetch] = useState(7);
  const [isLoading, setIsloading] = useState(true);

  useEffect(() => {
    // get data for chart
    const getHistoricalData = async () => {
      setIsloading(true);
      const blocksToQuery = [...Array(daysToFetch)].map(
        (_, i) => latestSyncedBlock - BLOCKS_IN_A_DAY * i
      );

      const historicalRawData = await Promise.all(
        blocksToQuery
          .reverse() // reverse so that index 0 is oldest
          .map((blockNumber) =>
            screamClient.query<{ markets: RawMarket[] }>({
              query: MARKET_BASE_BY_BLOCK_QUERY,
              variables: {
                blockNumber,
                id: id as string,
              },
            })
          )
      );

      setHistoricalData(
        historicalRawData
          .map((raw) => transformMarketData(raw.data.markets)[0])
          .filter((data) => !!data)
      );
      setIsloading(false);
    };

    getHistoricalData();
  }, [latestSyncedBlock, id, daysToFetch]);

  if (loading || !data) return <Loading />;
  if (error) return <p>Error :(</p>;

  const market = transformMarketData(data.markets)[0];
  const yesterday =
    yesterdayMarkets.find((market) => market.id === id) ??
    ({
      totalSupplyUSD: 0,
      totalBorrowsUSD: 0,
      borrowAPY: 0,
      supplyAPY: 0,
      cash: '0',
    } as Market);

  return (
    <Layout className="p-5">
      <MarketHeader yesterday={yesterday} market={market} />

      <div className="flex flex-col lg:flex-row lg:justify-between">
        <div className="pb-8 lg:mr-20 lg:flex-1">
          <div className="flex justify-between items-center pb-3 border-b border-border-primary">
            <h3>Historical Utilization</h3>
            <div className="flex cursor-pointer">
              <div
                className={`border pt-1 px-4 ${daysToFetch === 7 && 'bg-border-primary'}`}
                style={{ borderRadius: '50px 0px 0px 50px' }}
              >
                <a onClick={() => setDaysToFetch(7)}>
                  <p>Week</p>
                </a>
              </div>
              <div
                className={`border pt-1 px-4 ${daysToFetch === 30 && 'bg-border-primary'}`}
                style={{ borderRadius: '0px 50px 50px 0px' }}
              >
                <a onClick={() => setDaysToFetch(30)}>
                  <p>Month</p>
                </a>
              </div>
            </div>
          </div>
          {!!historicalData.length && (
            <UtilizationChart data={historicalData} isLoading={isLoading} />
          )}
        </div>

        <MarketState yesterday={yesterday} market={market} />
      </div>
    </Layout>
  );
}
