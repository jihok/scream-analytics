import { useRouter } from 'next/router';
import { useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { useMarketContext } from '../../contexts/MarketContext';

// TODO: shareable with tailwind.config?
const COLORS = [
  '#00FFFF',
  '#FF0F6C',
  '#A20BFF',
  '#6CFFBD',
  '#FF26B2',
  '#FF9900',
  '#4F4F50', // 'other' color
];

interface ChartData {
  name: string;
  percent: number;
  id?: string;
}

export default function ReservesBreakdown() {
  const { todayMarkets } = useMarketContext();
  const [showTop, setShowTop] = useState(true);
  const router = useRouter();

  const totalReservesUSD = todayMarkets.reduce((prev, curr) => prev + curr.reserves, 0);
  const data: ChartData[] = todayMarkets
    .map((market) => ({
      name: market.underlyingSymbol,
      percent: (market.reserves / totalReservesUSD) * 100,
      id: market.id,
    }))
    .sort((a, b) => b.percent - a.percent);
  const chartData: ChartData[] = data.slice(0, 6);
  const otherPercent = 100 - chartData.reduce((prev, curr) => prev + curr.percent, 0);
  chartData.push({
    name: 'Other',
    percent: otherPercent,
  });

  return (
    <div className="flex flex-col">
      <PieChart width={300} height={300}>
        <Pie data={chartData} dataKey="percent">
          {chartData.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
      </PieChart>

      <div className="flex text-center mb-4">
        <p
          className={`${
            showTop
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pb-3 cursor-pointer`}
          onClick={() => setShowTop(true)}
        >
          Top 6
        </p>
        <p
          className={`${
            !showTop
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pb-3 cursor-pointer flex justify-center`}
          onClick={() => setShowTop(false)}
        >
          <span className="flex items-center">
            <div className="rounded-full h-2 w-2 mr-2 mt-0.5 bg-bar-6" />
            Other
          </span>
        </p>
      </div>

      {showTop && (
        <>
          {data.slice(0, 6).map((d, i) => (
            <div
              className="flex mt-2 cursor-pointer"
              key={d.name}
              onClick={async () => await router.push(`/market/${d.id}`)}
            >
              <div className={`rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-${i}`} />
              <p className="flex-col">
                <div className="font-sans-semibold">{d.name}</div>
                {d.percent.toFixed(2)}%
              </p>
            </div>
          ))}
        </>
      )}

      {!showTop && (
        <>
          <div className="flex mt-2">
            <div className="rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-6" />
            <p className="flex-col pb-2 border-b border-border-primary">
              <div className="font-sans-semibold">Other</div>
              {otherPercent.toFixed(2)}%
            </p>
          </div>
          {data.slice(6, 10).map((d) => (
            <div
              className="flex mt-2 pl-3 cursor-pointer"
              key={d.name}
              onClick={async () => await router.push(`/market/${d.id}`)}
            >
              <p className="flex-col">
                <div className="font-sans-semibold">{d.name}</div>
                {d.percent.toFixed(2)}%
              </p>
            </div>
          ))}
          <p className="pt-2 pl-3">+ {data.length - 10} more</p>
        </>
      )}
    </div>
  );
}
