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
      <div className="pb-8 flex flex-col lg:flex-row lg:justify-between">
        {/* asset name and price */}
        <div className="flex flex-row justify-between lg:flex-col">
          <div className="flex flex-row">
            <Image
              src={`/img/tokens/${market.underlyingSymbol}.svg`}
              width={33}
              height={33}
              alt={market.underlyingSymbol}
            />
            <div className="ml-3 lg:ml-5">
              <span className="lg:flex lg:flex-row-reverse lg:justify-end lg:items-baseline">
                <p className="pb-1 lg:ml-2">{market.underlyingSymbol}</p>
                <p className="font-sans-semibold text-subheading">{market.underlyingName}</p>
              </span>
              <h1 className="invisible lg:visible">
                {usdFormatter.format(market.underlyingPrice)}
              </h1>
            </div>
          </div>
          <h1 className="lg:invisible">{usdFormatter.format(market.underlyingPrice)}</h1>
        </div>

        {/* mutable asset metrics */}
        <div className="flex justify-center mt-7 lg:mt-1">
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
        <div className="pb-8">
          <div className="flex justify-between items-center pb-3 border-b border-border-primary">
            <h3>Historical Utilization</h3>
            <div className="flex">
              <div
                className={`border py-2 px-4 ${daysToFetch === 7 && 'bg-border-primary'}`}
                style={{ borderRadius: '50px 0px 0px 50px' }}
              >
                <a onClick={() => setDaysToFetch(7)}>
                  <p>Weekly</p>
                </a>
              </div>
              <div
                className={`border py-2 px-4 ${daysToFetch === 30 && 'bg-border-primary'}`}
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

        <div>
          <div className="pb-8">
            <h3 className="pb-3 border-b border-border-primary">Current State</h3>
            <table className="w-full mb-5">
              <thead className="caption-label">
                <tr className="border-border-secondary border-b">
                  <th />
                  <th>APY</th>
                  <th>Distribution APY</th>
                  <th>Net APY</th>
                </tr>
              </thead>
              <tr className="border-border-secondary border-b">
                <td className="caption-label">Supply</td>
                <td>
                  <h2>{market.supplyAPY.toFixed(2)}%</h2>
                  <PercentChange yesterdayVal={yesterday.supplyAPY} todayVal={market.supplyAPY} />
                </td>
                <td>
                  <h2>{supplyDistribution.toFixed(2)}%</h2>
                </td>
                <td>
                  <h2>{(market.supplyAPY + supplyDistribution).toFixed(2)}%</h2>
                </td>
              </tr>
              <tr className="border-border-primary border-b">
                <td className="caption-label">Borrow</td>
                <td>
                  <h2>{market.borrowAPY.toFixed(2)}%</h2>
                  <PercentChange yesterdayVal={yesterday.borrowAPY} todayVal={market.borrowAPY} />
                </td>
                <td>
                  <h2>{borrowDistribution.toFixed(2)}%</h2>
                </td>
                <td>
                  <h2>{(market.borrowAPY - borrowDistribution).toFixed(2)}%</h2>
                </td>
              </tr>
            </table>

            <div className="flex whitespace-nowrap mb-3">
              <p>Interest paid per day</p>
              <div className="border-b border-border-secondary w-full mb-1 mx-2" />
              <p className="font-sans-semibold">
                {usdFormatter.format(
                  (market.borrowAPY * market.underlyingPrice * market.totalBorrowsUSD) / 365
                )}
              </p>
            </div>
            <div className="flex whitespace-nowrap mb-3">
              <p>Total interest produced by borrowed assets</p>
              <div className="border-b border-border-secondary w-full mb-1 mx-2" />
              <p className="font-sans-semibold">
                {usdFormatter.format(market.totalInterestAccumulated)}
              </p>
            </div>
            <div className="flex whitespace-nowrap mb-3">
              <p>Exchange rate </p>
              <div className="border-b border-border-secondary w-full mb-1 mx-2" />
              <p className="font-sans-semibold">
                1 {market.underlyingSymbol} = {market.exchangeRate} {market.symbol}
              </p>
            </div>
            <div className="flex whitespace-nowrap">
              <p>{market.symbol} Minted</p>
              <div className="border-b border-border-secondary w-full mb-1 mx-2" />
              <p className="font-sans-semibold">{(+market.totalSupply).toLocaleString()}</p>
            </div>
          </div>

          <div>
            <h3 className="pb-3 border-b border-border-primary">Market Parameters</h3>
            <div className="flex mt-5">
              <div className="pr-6">
                <div className="caption-label">Reserve Factor</div>
                <h2 className="py-1">{market.reserveFactor * 100}%</h2>
              </div>
              <div className="pr-6">
                <div className="caption-label">Collateral Factor</div>
                <h2 className="py-1">{market.collateralFactor * 100}%</h2>
              </div>
              <div className="pr-6">
                <div className="caption-label">{market.underlyingSymbol} borrow cap</div>
                <h2 className="py-1">No Limit</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
