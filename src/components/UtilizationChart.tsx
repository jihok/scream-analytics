import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Line,
  LineChart,
  Tooltip,
  TooltipProps,
  YAxis,
} from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';
import { formatDisplay, Market } from '../utils/Market';

interface Props {
  data: Market[];
}

export default function UtilizationChart({ data }: Props) {
  const [focusedBar, setFocusedBar] = useState<number>();

  const onMouseMove = ({ isTooltipActive, activeTooltipIndex }: CategoricalChartState) => {
    if (isTooltipActive) {
      setFocusedBar(activeTooltipIndex);
    } else {
      setFocusedBar(undefined);
    }
  };

  return (
    <div>
      <LineChart
        syncId="utilization"
        width={400}
        height={200}
        data={data}
        margin={{
          right: 30,
          left: 30,
        }}
        onMouseMove={onMouseMove}
      >
        <Tooltip
          cursor={{ strokeDasharray: 2 }}
          wrapperStyle={{ backgroundColor: 'red' }}
          content={({ payload, active }) => (
            <CustomToolTip payload={payload} active={active} type="apy" />
          )}
        />
        <Line dataKey="borrowAPY" stroke="#8884d8" dot={false} />
        <Line dataKey="supplyAPY" stroke="#82ca9d" dot={false} />
      </LineChart>
      <BarChart syncId="utilization" width={400} height={200} data={data} onMouseMove={onMouseMove}>
        <Tooltip
          // cursor={false}
          content={({ payload, active }) => (
            <CustomToolTip payload={payload} active={active} type="marketSize" />
          )}
        />
        <YAxis yAxisId="marketSize" hide />
        <Bar yAxisId="marketSize" dataKey="totalBorrowsUSD" stackId="a" fill="#8884d8">
          {data.map((entry, i) => (
            <Cell key={entry.id} fill={focusedBar === i ? '#8884d8' : 'rgba(43, 92, 231, 0.2)'} />
          ))}
        </Bar>
        <Bar yAxisId="marketSize" dataKey="totalSupplyUSD" stackId="a" fill="#82ca9d">
          {data.map((entry, i) => (
            <Cell key={entry.id} fill={focusedBar === i ? '#82ca9d' : 'rgba(43, 92, 231, 0.2)'} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
}

const CustomToolTip = ({ payload, active, type }: TooltipProps<any, any> & { type: string }) => {
  if (!active || !payload) return null;

  return (
    <div>
      {type === 'marketSize' ? (
        <>
          <p>Total Borrowed</p>
          <p>{formatDisplay(payload[0].value)}</p>
          <hr />
          <p>Total Supplied</p>
          <p>{formatDisplay(payload[1].value)}</p>
        </>
      ) : (
        <>
          <p>Borrow APY</p>
          <p>{payload[0].value.toFixed(2)}%</p>
          <hr />
          <p>Supply APY</p>
          <p>{payload[1].value.toFixed(2)}%</p>
        </>
      )}
    </div>
  );
};
