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
  isLoading: boolean;
}

export default function UtilizationChart({ data, isLoading }: Props) {
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
        {!isLoading ? (
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

            {/* arbitrary bottom padding to align lines above bars */}
            <YAxis yAxisId="bApy" hide padding={{ bottom: 100 }} />
            <YAxis yAxisId="sApy" hide padding={{ bottom: 100 }} />
            <Line yAxisId="bApy" dataKey="borrowAPY" stroke={BORROW_COLOR} dot={false} />
            <Line yAxisId="sApy" dataKey="supplyAPY" stroke={SUPPLY_COLOR} dot={false} />

            {/* arbitrary top padding to align bars below lines */}
            <YAxis yAxisId="marketSize" hide padding={{ top: 100 }} />
            <Bar yAxisId="marketSize" dataKey="reserves" stackId="marketDay" fill={RESERVE_COLOR}>
              {data.map((entry, i) => (
                <Cell
                  key={`${entry.reserves}-${entry.underlyingPrice}`}
                  fill={focusedBar === i ? RESERVE_COLOR : '#31333799'}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="marketSize"
              dataKey="totalBorrowsUSD"
              stackId="marketDay"
              fill={BORROW_COLOR}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`${entry.borrowRate}-${entry.totalBorrowsUSD}`}
                  fill={focusedBar === i ? BORROW_COLOR : '#31333799'}
                />
              ))}
            </Bar>
            <Bar
              yAxisId="marketSize"
              dataKey="totalSupplyUSD"
              stackId="marketDay"
              fill={SUPPLY_COLOR}
              radius={data.length <= 7 ? [5, 5, 0, 0] : [2, 2, 0, 0]}
            >
              {data.map((entry, i) => (
                <Cell
                  key={`${entry.supplyRate}-${entry.totalSupplyUSD}`}
                  fill={focusedBar === i ? SUPPLY_COLOR : '#31333799'}
                />
              ))}
            </Bar>
          </ComposedChart>
        ) : (
          <div />
        )}
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
