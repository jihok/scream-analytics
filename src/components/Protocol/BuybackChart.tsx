import { format } from 'date-fns';
import { useState } from 'react';
import { ResponsiveContainer, BarChart, YAxis, Tooltip, Bar } from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';
import { Buyback } from '../../utils';
import { SUPPLY_COLOR } from '../Market/UtilizationChart';

interface Props {
  data: Buyback[];
}

export default function BuybackChart({ data }: Props) {
  const [focusedBar, setFocusedBar] = useState<number | undefined>(data.length - 1);
  console.log(data);
  console.log(focusedBar);
  return (
    <>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          onMouseMove={(state: CategoricalChartState) => {
            setFocusedBar(state?.activeTooltipIndex ?? undefined);
          }}
        >
          <YAxis hide />
          <Bar dataKey="amount" fill={SUPPLY_COLOR} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex w-fit items-center bg-darkGray shadow-3xl mt-3 caption-label">
        <div className="px-5">
          {focusedBar !== undefined
            ? format(new Date(data[focusedBar].blockTimestamp * 1000), 'MMM d')
            : '--'}
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1" style={{ color: SUPPLY_COLOR }}>
            SCREAM
          </div>
          <p>{focusedBar !== undefined ? data[focusedBar].amount.toFixed(2) : '--'}</p>
        </div>
        {/*
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1" style={{ color: BORROW_COLOR }}>
            Total borrowed
          </div>
          <p>
            {focusedBar !== undefined ? formatAbbrUSD(data[focusedBar]?.totalBorrowsUSD) : '--'}
          </p>
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1" style={{ color: RESERVE_COLOR }}>
            Reserves
          </div>
          <p>{focusedBar !== undefined ? formatAbbrUSD(data[focusedBar]?.reserves) : '--'}</p>
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1 text-secondary">Liquidity</div>
          <p>
            {focusedBar !== undefined
              ? formatAbbrUSD(+data[focusedBar]?.cash * data[focusedBar]?.underlyingPrice)
              : '--'}
          </p>
        </div> */}
      </div>
    </>
  );
}
