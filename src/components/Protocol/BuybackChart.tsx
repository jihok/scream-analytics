import { format } from 'date-fns';
import { useState } from 'react';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { ResponsiveContainer, BarChart, YAxis, Bar } from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/generateCategoricalChart';
import { Buyback } from '../../utils';
import { SUPPLY_COLOR } from '../Market/UtilizationChart';
import { usdFormatter } from '../../utils/Market';

interface Props {
  data: Buyback[];
}

export default function BuybackChart({ data }: Props) {
  const [focusedBar, setFocusedBar] = useState<number | undefined>(data.length - 1);
  const { screamPrice } = useGlobalContext();

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
        <div className="px-5 label-body">
          {focusedBar !== undefined
            ? format(new Date(data[focusedBar].blockTimestamp * 1000), 'MMM d')
            : '--'}
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1 label-body">SCREAM</div>
          <p>{focusedBar !== undefined ? data[focusedBar].amount.toFixed(2) : '--'}</p>
        </div>
        <div className="px-5 py-3 border-l border-border-secondary">
          <div className="pb-1 label-body">USD (current)</div>
          <p>
            {focusedBar !== undefined
              ? usdFormatter.format(data[focusedBar].amount * screamPrice)
              : '--'}
          </p>
        </div>
      </div>
    </>
  );
}
