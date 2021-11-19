import React from 'react';
import { Bar, BarChart, Line, LineChart, Tooltip, TooltipProps, YAxis } from 'recharts';
import { formatDisplay, Market } from '../utils/Market';

interface Props {
  data: Market[];
}

export default function UtilizationChart({ data }: Props) {
  return (
    <div>
      <LineChart
        syncId="utilization"
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
          content={({ payload, active }) => (
            <CustomToolTip payload={payload} active={active} type="apy" />
          )}
        />
        <YAxis yAxisId="apy" display="none" />
        <Line yAxisId="apy" dataKey="borrowAPY" stroke="#8884d8" dot={false} />
        <Line yAxisId="apy" dataKey="supplyAPY" stroke="#82ca9d" dot={false} />
      </LineChart>
      <BarChart
        syncId="utilization"
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
          content={({ payload, active }) => (
            <CustomToolTip payload={payload} active={active} type="marketSize" />
          )}
        />
        <YAxis yAxisId="marketSize" display="none" />
        <Bar yAxisId="marketSize" dataKey="totalBorrowsUSD" stackId="a" fill="#8884d8" />
        <Bar yAxisId="marketSize" dataKey="totalSupplyUSD" stackId="a" fill="#82ca9d" />
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
