import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useState } from 'react';
import UtilizationChart from '../../src/components/UtilizationChart';
import { useGlobalContext } from '../../src/contexts/GlobalContext';
import { BLOCKS_IN_A_DAY, useMarketContext } from '../../src/contexts/MarketContext';
import { ASSET_BY_BLOCK_QUERY } from '../../src/queries';
import { getCompSpeeds, getScreamPrice } from '../../src/utils';
import { Market, RawMarket, transformData } from '../../src/utils/Market';
import { screamClient } from '../_app';

export default function MarketPage() {
  const { latestSyncedBlock } = useGlobalContext();
  const { todayMarkets } = useMarketContext();
  const { query } = useRouter();
  const market = todayMarkets.find((market) => market.id === query.id);
  const [distributionAPY, setDistributionAPY] = useState({ supply: 0, borrow: 0 });
  const [historicalData, setHistoricalData] = useState<Market[]>([]);

  useEffect(() => {
    const getData = async (asset: Market) => {
      const [compSpeeds, screamPrice] = await Promise.all([
        getCompSpeeds(asset.id),
        getScreamPrice(),
      ]);
      setDistributionAPY({
        supply: ((BLOCKS_IN_A_DAY * 365) / asset.totalSupplyUSD) * compSpeeds * screamPrice * 100,
        borrow: ((BLOCKS_IN_A_DAY * 365) / asset.totalBorrowsUSD) * compSpeeds * screamPrice * 100,
      });

      const blocksToQuery = [...Array(7)].map((_, i) => latestSyncedBlock - BLOCKS_IN_A_DAY * i);

      const historicalRawData = await Promise.all(
        blocksToQuery.map((blockNumber) =>
          screamClient.query<{ markets: RawMarket[] }>({
            query: ASSET_BY_BLOCK_QUERY,
            variables: {
              blockNumber,
              id: asset.id,
            },
          })
        )
      );

      setHistoricalData(historicalRawData.map((raw) => transformData(raw.data.markets)[0]));
    };

    if (market) {
      getData(market);
    }
  }, [latestSyncedBlock, market]);

  if (!market) return <p>Error :(</p>;

  return (
    <div>
      Distribution APY (Supply): {`${distributionAPY.supply.toFixed(2)}%`}
      Distribution APY (Borrow): {`${distributionAPY.borrow.toFixed(2)}%`}
      <UtilizationChart data={historicalData} />
    </div>
  );
}
