import React, { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  YAxis,
} from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';
import { formatAbbrUSD, Market } from '../utils/Market';

export const BORROW_COLOR = '#FFB158';
export const SUPPLY_COLOR = '#C8A6FF';
const RESERVE_COLOR = '#F7C893';
interface Props {
  data: Market[];
}

export default function UtilizationChart({ data }: Props) {
  const [focusedBar, setFocusedBar] = useState<number | undefined>(data.length - 1);

  useEffect(() => {
    setFocusedBar(data.length - 1);
  }, [data]);

  const defaultTooltipPayload = [
    { value: data[data.length - 1].borrowAPY },
    { value: data[data.length - 1].supplyAPY },
    { value: data[data.length - 1].totalBorrowsUSD },
    { value: data[data.length - 1].totalSupplyUSD },
  ];

  return (
    <>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          margin={{ top: 100 }}
          data={data}
          onMouseMove={({ isTooltipActive, activeTooltipIndex }: CategoricalChartState) => {
            if (isTooltipActive) {
              setFocusedBar(activeTooltipIndex);
            } else {
              setFocusedBar(undefined);
            }
          }}
          onClick={(e?: CategoricalChartState) => {
            if (e) {
              setFocusedBar(e.activeTooltipIndex);
            }
          }}
          // defaultShowTooltip
        >
          <Tooltip
            wrapperStyle={{ visibility: 'visible' }}
            cursor={{ strokeDasharray: 2 }}
            content={({ payload, active }) => (
              <CustomToolTip
                payload={payload || defaultTooltipPayload}
                active={active && focusedBar !== undefined}
              />
            )}
          />

          <YAxis yAxisId="bApy" hide padding={{ bottom: 100 }} />
          <YAxis yAxisId="sApy" hide padding={{ bottom: 100 }} />
          <Line yAxisId="bApy" dataKey="borrowAPY" stroke={BORROW_COLOR} dot={false} />
          <Line yAxisId="sApy" dataKey="supplyAPY" stroke={SUPPLY_COLOR} dot={false} />

          <YAxis yAxisId="marketSize" hide padding={{ top: 100 }} />
          <Bar yAxisId="marketSize" dataKey="reserves" stackId="a" fill={RESERVE_COLOR}>
            {data.map((entry, i) => (
              <Cell key={entry.id} fill={focusedBar === i ? RESERVE_COLOR : '#31333799'} />
            ))}
          </Bar>
          <Bar yAxisId="marketSize" dataKey="totalBorrowsUSD" stackId="a" fill={BORROW_COLOR}>
            {data.map((entry, i) => (
              <Cell key={entry.id} fill={focusedBar === i ? BORROW_COLOR : '#31333799'} />
            ))}
          </Bar>
          <Bar yAxisId="marketSize" dataKey="totalSupplyUSD" stackId="a" fill={SUPPLY_COLOR}>
            {data.map((entry, i) => (
              <Cell key={entry.id} fill={focusedBar === i ? SUPPLY_COLOR : '#31333799'} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex w-fit items-center bg-darkGray shadow-3xl mt-3 caption-label">
        <div className="px-5">
          {focusedBar !== undefined
            ? format(subDays(Date.now(), data.length - 1 - focusedBar), 'MMM d')
            : '--'}
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1" style={{ color: SUPPLY_COLOR }}>
            Total supplied
          </div>
          <p>{focusedBar !== undefined ? formatAbbrUSD(data[focusedBar]?.totalSupplyUSD) : '--'}</p>
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1" style={{ color: BORROW_COLOR }}>
            Total borrowed
          </div>
          <p>
            {focusedBar !== undefined ? formatAbbrUSD(data[focusedBar]?.totalBorrowsUSD) : '--'}
          </p>
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1" style={{ color: BORROW_COLOR }}>
            Reserves
          </div>
          {/* @ts-ignore TODO reserves */}
          <p>{focusedBar !== undefined ? formatAbbrUSD(data[focusedBar]?.reserves) : '--'}</p>
        </div>
      </div>
    </>
  );
}

const CustomToolTip = ({ payload, active }: TooltipProps<any, any>) => {
  if (!active || !payload) return null;

  return (
    <div className="flex bg-darkGray p-3 shadow-3xl">
      <div className="mr-4">
        <p className="caption-label" style={{ color: SUPPLY_COLOR }}>
          Supply APY
        </p>
        <p>{payload[1].value.toFixed(2)}%</p>
      </div>
      <div>
        <p className="caption-label" style={{ color: BORROW_COLOR }}>
          Borrow APY
        </p>
        <p>{payload[0].value.toFixed(2)}%</p>
      </div>
    </div>
  );
};
