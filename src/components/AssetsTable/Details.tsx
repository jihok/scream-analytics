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
import { formatDisplay, Market, RawMarket, transformData } from '../../utils/Market';

interface Props {
  asset: any;
}

export function Details({ asset }: Props) {
  const { latestSyncedBlock } = useGlobalContext();
  console.log('passed down info: ', latestSyncedBlock, asset);

  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
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
      setData(a.map((b) => transformData(b.data.markets)[0]));
      console.log(a.map((b) => transformData(b.data.markets)[0]));
    })();
  }, [latestSyncedBlock, asset]);

  return (
    <div>
      <ComposedChart
        width={800}
        height={300}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <Tooltip
          cursor={{ strokeDasharray: 2 }}
          content={({ payload, active }) => <CustomToolTip payload={payload} active={active} />}
        />
        <YAxis yAxisId="marketSize" orientation="left" padding={{ top: 100 }} />
        <Bar yAxisId="marketSize" dataKey="totalBorrowsUSD" stackId="a" fill="#8884d8" />
        <Bar yAxisId="marketSize" dataKey="totalSupplyUSD" stackId="a" fill="#82ca9d" />
        <YAxis yAxisId="apy" orientation="right" padding={{ bottom: 200 }} />
        <Line yAxisId="apy" dataKey="borrowAPY" stroke="#8884d8" />
        <Line yAxisId="apy" dataKey="supplyAPY" stroke="#82ca9d" />
      </ComposedChart>
    </div>
  );
}

const CustomToolTip = ({ payload, active }: TooltipProps<any, any>) => {
  if (!active || !payload) return null;

  return (
    <div>
      <p>Borrow APY</p>
      <p>{payload[2].value.toFixed(2)}%</p>
      <p>Supply APY</p>
      <p>{payload[3].value.toFixed(2)}%</p>
      <p>Total Borrowed</p>
      <p>{formatDisplay(payload[0].value)}</p>
      <p>Total Supplied</p>
      <p>{formatDisplay(payload[1].value)}</p>
    </div>
  );
};
