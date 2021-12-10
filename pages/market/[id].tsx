import { useQuery } from '@apollo/client';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Layout from '../../src/components/Layout';
import PercentChange from '../../src/components/PercentChange';
import UtilizationChart from '../../src/components/UtilizationChart';
import { useGlobalContext } from '../../src/contexts/GlobalContext';
import { BLOCKS_IN_A_DAY, useMarketContext } from '../../src/contexts/MarketContext';
import { MARKET_BASE_BY_BLOCK_QUERY, MARKET_DETAILS_QUERY } from '../../src/queries';
import { getCompSpeeds } from '../../src/utils';
import {
  formatAbbrUSD,
  Market,
  MarketDetails,
  RawMarket,
  RawMarketDetails,
  transformData,
  usdFormatter,
} from '../../src/utils/Market';
import { screamClient } from '../_app';

export default function MarketPage() {
  const { latestSyncedBlock, screamPrice } = useGlobalContext();
  const { yesterdayMarkets } = useMarketContext();
  const {
    query: { id },
  } = useRouter();
  const { loading, error, data } = useQuery<{ markets: RawMarketDetails[] }>(MARKET_DETAILS_QUERY, {
    variables: { id },
  });
  const [compSpeeds, setCompSpeeds] = useState(0);

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
    // fetch compSpeeds with id passed from router
    const getDistributionData = async () => {
      setCompSpeeds(await getCompSpeeds(id as string));
    };
    getDistributionData();
  }, [id]);

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
  if (error) return <p>Error :( - no market</p>;

  const supplyDistribution =
    ((BLOCKS_IN_A_DAY * 365) / market.totalSupplyUSD) * compSpeeds * screamPrice * 100;
  const borrowDistribution =
    ((BLOCKS_IN_A_DAY * 365) / market.totalBorrowsUSD) * compSpeeds * screamPrice * 100;

  return (
    <Layout className="p-5">
      <div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row">
            <Image
              src={`/img/tokens/${market.underlyingSymbol}.svg`}
              width={33}
              height={33}
              alt={market.underlyingSymbol}
            />
            <span className="ml-3 lg:ml-5">
              <p className="pb-1">{market.underlyingSymbol}</p>
              <p className="font-sans-semibold text-subheading">{market.underlyingName}</p>
            </span>
          </div>
          <h1>{usdFormatter.format(market.underlyingPrice)}</h1>
        </div>
        <div className="flex mt-7 justify-center">
          <div className="pr-6">
            <div className="caption-label">Supplied</div>
            <h2 className="py-1">{formatAbbrUSD(market.totalSupplyUSD)}</h2>
            <PercentChange
              yesterdayVal={yesterday.totalSupplyUSD}
              todayVal={market.totalSupplyUSD}
            />
          </div>
          <div className="pr-6">
            <div className="caption-label">Borrowed</div>
            <h2 className="py-1">{formatAbbrUSD(market.totalBorrowsUSD)}</h2>
            <PercentChange
              yesterdayVal={yesterday.totalBorrowsUSD}
              todayVal={market.totalBorrowsUSD}
            />
          </div>
          <div className="pr-6">
            <div className="caption-label">Utilization</div>
            <h2 className="py-1">
              {((market.totalBorrowsUSD / market.totalSupplyUSD) * 100).toFixed(2)}%
            </h2>
            <PercentChange
              yesterdayVal={yesterday.totalBorrowsUSD / yesterday.totalSupplyUSD}
              todayVal={market.totalBorrowsUSD / market.totalSupplyUSD}
            />
          </div>
          <div>
            <div className="caption-label">Liquidity</div>
            <h2 className="py-1">{formatAbbrUSD(+market.cash)}</h2>
            <PercentChange yesterdayVal={+yesterday.cash} todayVal={+market.cash} />
          </div>
        </div>
      </div>
      <div>
        <div>
          <div>
            Current State
            <table>
              <tr>
                <th />
                <th>APY</th>
                <th>Distribution APY</th>
                <th>Net APY</th>
              </tr>
              <tr>
                <td>Supply</td>
                <td>
                  {market.supplyAPY.toFixed(2)}%
                  <PercentChange yesterdayVal={yesterday.supplyAPY} todayVal={market.supplyAPY} />
                </td>
                <td>{supplyDistribution.toFixed(2)}%</td>
                <td>{(market.supplyAPY + supplyDistribution).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Borrow</td>
                <td>
                  {market.borrowAPY.toFixed(2)}%
                  <PercentChange yesterdayVal={yesterday.borrowAPY} todayVal={market.borrowAPY} />
                </td>
                <td>{borrowDistribution.toFixed(2)}%</td>
                <td>{(market.borrowAPY - borrowDistribution).toFixed(2)}%</td>
              </tr>
            </table>
            <div style={{ display: 'flex' }}>
              <div>Interest paid per day</div>
              <div style={{ borderBottom: '1px dotted black', width: '100%' }} />
              <div>
                {usdFormatter.format(
                  (market.borrowAPY * market.underlyingPrice * market.totalBorrowsUSD) / 365
                )}
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div>Total interest produced by borrowed assets </div>
              <div style={{ borderBottom: '1px dotted black', width: '100%' }} />
              <div>{usdFormatter.format(market.totalInterestAccumulated)}</div>
            </div>
            <div style={{ display: 'flex' }}>
              <div>Exchange rate </div>
              <div style={{ borderBottom: '1px dotted black', width: '100%' }} />
              <div>
                1 {market.underlyingSymbol} = {market.exchangeRate}
                {market.symbol}
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div>{market.symbol} Minted</div>
              <div style={{ borderBottom: '1px dotted black', width: '100%' }} />
              <div>{(+market.totalSupply).toLocaleString()}</div>
            </div>
          </div>
          <div>
            Market Parameters
            <div>Reserve factor {market.reserveFactor * 100}%</div>
            <div>Collateral factor {market.collateralFactor * 100}%</div>
            <div>{market.underlyingSymbol} borrow cap No Limit</div>
          </div>
        </div>
        <div>
          Historical view of utilization
          <a onClick={() => setDaysToFetch(7)}>Weekly</a>
          <a onClick={() => setDaysToFetch(30)}>Monthly</a>
          <UtilizationChart data={historicalData} />
        </div>
      </div>
    </Layout>
  );
}
