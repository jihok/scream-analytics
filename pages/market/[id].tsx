import { useQuery } from '@apollo/client';
import { ethers } from 'ethers';
import { useRouter } from 'next/dist/client/router';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import UtilizationChart from '../../src/components/UtilizationChart';
import { useGlobalContext } from '../../src/contexts/GlobalContext';
import { BLOCKS_IN_A_DAY, useMarketContext } from '../../src/contexts/MarketContext';
import { MARKET_BASE_BY_BLOCK_QUERY, MARKET_DETAILS_QUERY } from '../../src/queries';
import { getCompSpeeds, getScreamPrice } from '../../src/utils';
import {
  Market,
  MarketDetails,
  RawMarket,
  RawMarketDetails,
  transformData,
  usdFormatter,
} from '../../src/utils/Market';
import { screamClient } from '../_app';

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
  const [distributionAPY, setDistributionAPY] = useState({ supply: 0, borrow: 0 });
  const [historicalData, setHistoricalData] = useState<Market[]>([]);

  useEffect(() => {
    const getMarketDetails = async (market: MarketDetails) => {
      const [compSpeeds, screamPrice] = await Promise.all([
        getCompSpeeds(id as string),
        getScreamPrice(),
      ]);
      setDistributionAPY({
        supply: ((BLOCKS_IN_A_DAY * 365) / market.totalSupplyUSD) * compSpeeds * screamPrice * 100,
        borrow: ((BLOCKS_IN_A_DAY * 365) / market.totalBorrowsUSD) * compSpeeds * screamPrice * 100,
      });

      const blocksToQuery = [...Array(7)].map((_, i) => latestSyncedBlock - BLOCKS_IN_A_DAY * i);

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

      console.log('hey', market);
      setMarket(market);
      setHistoricalData(historicalRawData.map((raw) => transformData(raw.data.markets)[0]));
    };

    if (data) {
      getMarketDetails(transformData(data.markets)[0]);
    }
  }, [latestSyncedBlock, id, data]);

  if (!market) return <p>Error :(</p>;

  return (
    <main>
      {/* TODO: make a base component for this header/footer */}
      <Link href="/">
        <a>⬅️ Back to Market Analytics</a>
      </Link>
      <div>
        {market.underlyingName}
        {market.underlyingSymbol}
        {usdFormatter.format(market.underlyingPrice)}
      </div>
      <div style={{ display: 'flex' }}>
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
                <td>{market.supplyAPY.toFixed(2)}%</td>
                <td>{distributionAPY.supply.toFixed(2)}%</td>
                <td>{(market.supplyAPY + distributionAPY.supply).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Borrow</td>
                <td>{market.borrowAPY.toFixed(2)}%</td>
                <td>{distributionAPY.borrow.toFixed(2)}%</td>
                <td>{(market.borrowAPY - distributionAPY.borrow).toFixed(2)}%</td>
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
        <UtilizationChart data={historicalData} />
      </div>
    </main>
  );
}
