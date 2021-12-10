import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import Layout from '../../src/components/Layout';
import UtilizationChart from '../../src/components/UtilizationChart';
import { useGlobalContext } from '../../src/contexts/GlobalContext';
import { BLOCKS_IN_A_DAY, useMarketContext } from '../../src/contexts/MarketContext';
import { MARKET_BASE_BY_BLOCK_QUERY, MARKET_DETAILS_QUERY } from '../../src/queries';
import {
  Market,
  MarketDetails,
  RawMarket,
  RawMarketDetails,
  transformData,
} from '../../src/utils/Market';
import { screamClient } from '../_app';
import MarketHeader from '../../src/components/Market/Header';
import MarketState from '../../src/components/Market/State';

export default function MarketPage() {
  const { latestSyncedBlock } = useGlobalContext();
  const { yesterdayMarkets } = useMarketContext();
  const {
    query: { id },
  } = useRouter();
  const { loading, error, data } = useQuery<{ markets: RawMarketDetails[] }>(MARKET_DETAILS_QUERY, {
    variables: { id },
  });

  const [market, setMarket] = useState<MarketDetails>();
  const [historicalData, setHistoricalData] = useState<Market[]>([]);
  const [daysToFetch, setDaysToFetch] = useState(7);
  const yesterday =
    yesterdayMarkets.find((market) => market.id === id) ??
    ({
      totalSupplyUSD: 0,
      totalBorrowsUSD: 0,
      borrowAPY: 0,
      supplyAPY: 0,
      cash: '0',
    } as Market);

  useEffect(() => {
    // transform data for state once apollo query returns valid
    if (data) {
      setMarket(transformData(data.markets)[0]);
    }
  }, [data]);

  useEffect(() => {
    // get data for chart
    const getHistoricalData = async () => {
      const blocksToQuery = [...Array(daysToFetch)].map(
        (_, i) => latestSyncedBlock - BLOCKS_IN_A_DAY * i
      );

      const historicalRawData = await Promise.all(
        blocksToQuery.map((blockNumber) =>
          screamClient.query<{ markets: RawMarket[] }>({
            query: MARKET_BASE_BY_BLOCK_QUERY,
            variables: {
              blockNumber,
              id: id as string,
            },
          })
        )
      );

      setHistoricalData(historicalRawData.map((raw) => transformData(raw.data.markets)[0]));
    };

    getHistoricalData();
  }, [latestSyncedBlock, id, daysToFetch]);

  if (loading || !market) return <p>Loading</p>;
  if (error) return <p>Error :(</p>;

  return (
    <Layout className="p-5">
      <MarketHeader yesterday={yesterday} market={market} />

      <div className="flex flex-col lg:flex-row-reverse lg:justify-between">
        <div className="pb-8 lg:ml-20 lg:flex-1">
          <div className="flex justify-between items-center pb-3 border-b border-border-primary">
            <h3>Historical Utilization</h3>
            <div className="flex">
              <div
                className={`border py-1 px-4 ${daysToFetch === 7 && 'bg-border-primary'}`}
                style={{ borderRadius: '50px 0px 0px 50px' }}
              >
                <a onClick={() => setDaysToFetch(7)}>
                  <p>Weekly</p>
                </a>
              </div>
              <div
                className={`border py-1 px-4 ${daysToFetch === 30 && 'bg-border-primary'}`}
                style={{ borderRadius: '0px 50px 50px 0px' }}
              >
                <a onClick={() => setDaysToFetch(30)}>
                  <p>Monthly</p>
                </a>
              </div>
            </div>
          </div>
          <UtilizationChart data={historicalData} />
        </div>

        <MarketState yesterday={yesterday} market={market} />
      </div>
    </Layout>
  );
}
