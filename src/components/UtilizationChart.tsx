import React, { useState } from 'react';
import { Bar, BarChart, Cell, Line, LineChart, Tooltip, TooltipProps, YAxis } from 'recharts';
import { formatDisplay, Market } from '../utils/Market';

interface Props {
  data: Market[];
}

export default function UtilizationChart({ data }: Props) {
  const [focusedBar, setFocusedBar] = useState();

  return (
    <div>
      <LineChart
        syncId="utilization"
        width={800}
        height={200}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        onMouseMove={(state: any) => {
          if (state.isTooltipActive) {
            setFocusedBar(state.activeTooltipIndex);
          } else {
            setFocusedBar(undefined);
          }
        }}
      >
        <Tooltip
          cursor={{ strokeDasharray: 2 }}
          wrapperStyle={{ backgroundColor: 'red' }}
          // itemStyle={{ backgroundColor: 'purple' }}
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
        height={200}
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        onMouseMove={(state: any) => {
          if (state.isTooltipActive) {
            setFocusedBar(state.activeTooltipIndex);
          } else {
            setFocusedBar(undefined);
          }
        }}
      >
        <Tooltip
          cursor={{ strokeDasharray: 2 }}
          content={({ payload, active }) => (
            <CustomToolTip payload={payload} active={active} type="marketSize" />
          )}
        />
        <YAxis yAxisId="marketSize" display="none" />
        <Bar yAxisId="marketSize" dataKey="totalBorrowsUSD" stackId="a" fill="#8884d8">
          {data.map((entry, i) => (
            <Cell
              key={entry.id}
              fill={focusedBar === i ? '#8884d8' : 'rgba(43, 92, 231, 0.2)'}
              // for this, we make the hovered colour #2B5CE7, else its opacity decreases to 20%
            />
          ))}
        </Bar>
        <Bar yAxisId="marketSize" dataKey="totalSupplyUSD" stackId="a" fill="#82ca9d">
          {data.map((entry, i) => (
            <Cell
              key={entry.id}
              fill={focusedBar === i ? '#82ca9d' : 'rgba(43, 92, 231, 0.2)'}
              // for this, we make the hovered colour #2B5CE7, else its opacity decreases to 20%
            />
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
