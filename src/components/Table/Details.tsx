import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  Bar,
  BarChart,
  ComposedChart,
  Line,
  LineChart,
  Tooltip,
  TooltipProps,
  YAxis,
} from 'recharts';
import { NameType } from 'recharts/types/component/DefaultTooltipContent';
import { screamClient } from '../../../pages/_app';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { ASSET_BY_BLOCK_QUERY } from '../../queries';
import { formatAbbrUSD, Market, RawMarket, transformData } from '../../utils/Market';
import { getCompSpeeds, getScreamPrice } from '../../utils';
import UtilizationChart from '../UtilizationChart';
import { BLOCKS_IN_A_DAY } from '../../contexts/MarketContext';

interface Props {
  asset: Market;
}

export function Details({ asset }: Props) {
  const { latestSyncedBlock } = useGlobalContext();

  const [distributionAPY, setDistributionAPY] = useState({ supply: 0, borrow: 0 });
  const [historicalData, setHistoricalData] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [compSpeeds, screamPrice] = await Promise.all([
        getCompSpeeds(asset.id),
        getScreamPrice(),
      ]);
      setDistributionAPY({
        supply: ((BLOCKS_IN_A_DAY * 365) / asset.totalSupplyUSD) * compSpeeds * screamPrice * 100,
        borrow: ((BLOCKS_IN_A_DAY * 365) / asset.totalBorrowsUSD) * compSpeeds * screamPrice * 100,
      });

      const blocksToQuery = [...Array(7)].map((_, i) => latestSyncedBlock - BLOCKS_IN_A_DAY * i);
      console.log(blocksToQuery);
      const a = await Promise.all(
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

      console.log(
        'transformed data',
        a.map((b) => transformData(b.data.markets)[0])
      );

      setHistoricalData(a.map((b) => transformData(b.data.markets)[0]));
    })();
  }, [latestSyncedBlock, asset]);

  return (
    <div>
      Distribution APY (Supply): {`${distributionAPY.supply.toFixed(2)}%`}
      Distribution APY (Borrow): {`${distributionAPY.borrow.toFixed(2)}%`}
      <UtilizationChart data={historicalData} />
    </div>
  );
}
