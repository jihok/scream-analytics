import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
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
import { BLOCKS_IN_A_DAY } from '../../../pages';
import { screamClient } from '../../../pages/_app';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { ASSET_BY_BLOCK_QUERY } from '../../queries';
import { formatAbbrUSD, Market, RawMarket, transformData } from '../../utils/Market';
import { getCompSpeeds, getScreamPrice } from '../../utils';
import UtilizationChart from '../UtilizationChart';

interface Props {
  asset: Market;
}

export function Details({ asset }: Props) {
  const { latestSyncedBlock } = useGlobalContext();
  console.log('passed down info: ', latestSyncedBlock, asset);

  const [distributionAPY, setDistributionAPY] = useState<number>();
  const [historicalData, setHistoricalData] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [compSpeeds, screamPrice] = await Promise.all([
        getCompSpeeds(asset.id),
        getScreamPrice(),
      ]);
      setDistributionAPY(
        ((BLOCKS_IN_A_DAY * 365) / asset.totalSupplyUSD) * compSpeeds * screamPrice * 100
      );

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
      setHistoricalData(a.map((b) => transformData(b.data.markets)[0]));
      console.log(a.map((b) => transformData(b.data.markets)[0]));
    })();
  }, [latestSyncedBlock, asset]);

  return (
    <div>
      Distribution APY: {`${distributionAPY}%`}
      <UtilizationChart data={historicalData} />
    </div>
  );
}
