import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Customized,
  Label,
  LabelList,
  Line,
  LineChart,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';
import { formatAbbrUSD, Market } from '../utils/Market';

interface Props {
  data: Market[];
}

export default function UtilizationChart({ data }: Props) {
  const [focusedBar, setFocusedBar] = useState<number | undefined>(0);

  // const { borrowAPY, supplyAPY, totalBorrowsUSD, totalSupplyUSD } = data[0];
  const defaultTooltipPayload = [
    { value: data.length && data[0].borrowAPY },
    { value: data.length && data[0].supplyAPY },
    { value: data.length && data[0].totalBorrowsUSD },
    { value: data.length && data[0].totalSupplyUSD },
  ];

  if (!data.length || !data) {
    console.log('there si no data');
  }

  return <div></div>;

  return (
    <ComposedChart
      width={400}
      height={400}
      data={data}
      // onMouseMove={({ isTooltipActive, activeTooltipIndex }: CategoricalChartState) => {
      //   if (isTooltipActive) {
      //     setFocusedBar(activeTooltipIndex);
      //   } else {
      //     setFocusedBar(undefined);
      //   }
      // }}
      // onClick={({ activeTooltipIndex }: CategoricalChartState) => {
      //   setFocusedBar(activeTooltipIndex === focusedBar ? undefined : activeTooltipIndex);
      // }}
      // defaultShowTooltip
    >
      <Tooltip
        offset={20}
        wrapperStyle={{ visibility: 'visible' }}
        cursor={{ strokeDasharray: 2 }}
        content={({ payload, active }) => (
          <CustomToolTip payload={payload || defaultTooltipPayload} active={active} />
        )}
      />

      <YAxis yAxisId="apy" hide padding={{ bottom: 200 }} />
      <Line yAxisId="apy" dataKey="borrowAPY" stroke="#8884d8" dot={false} />
      <Line yAxisId="apy" dataKey="supplyAPY" stroke="#82ca9d" dot={false} />

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
        {/* <LabelList dataKey="totalBorrowsUSD" position="top" /> */}
      </Bar>
      {/* <Customized component={CustomLabelList}>asdf</Customized> */}
    </ComposedChart>
  );
}

// const CustomLabelList = (props) => {
//   console.log(props);
//   return <text>asdf</text>;
// };

const CustomToolTip = ({ payload, active }: TooltipProps<any, any>) => {
  if (!active || !payload) return null;

  return (
    <div
      style={{
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <p>Borrow APY</p>
        <p>{payload[0].value.toFixed(2)}%</p>
        <p>Supply APY</p>
        <p>{payload[1].value.toFixed(2)}%</p>
      </div>
      <div>
        <p>Total Borrowed</p>
        <p>{formatAbbrUSD(payload[2].value)}</p>
        <p>Total Supplied</p>
        <p>{formatAbbrUSD(payload[3].value)}</p>
      </div>
    </div>
  );
};
