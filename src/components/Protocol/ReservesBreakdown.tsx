import { useRouter } from 'next/router';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMarketContext } from '../../contexts/MarketContext';
import Image from 'next/image';
import { formatAbbrUSD } from '../../utils/Market';

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
  usd?: number;
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
      usd: market.reserves,
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
      <ResponsiveContainer width="100%">
        <PieChart width={300} height={300}>
          <Pie data={chartData} dataKey="percent">
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

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

      {(showTop ? data.slice(0, 6) : data.slice(6)).map((d, i) => (
        <div
          className="flex mt-2 cursor-pointer"
          key={d.name}
          onClick={async () => await router.push(`/market/${d.id}`)}
        >
          <span className="flex">
            {showTop && <span className={`rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-${i}`} />}
            <span className="text-body">{d.name}</span>
          </span>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <span className="text-body">{d.percent.toFixed(2)}%</span>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <span className="text-body">{formatAbbrUSD(d.usd || 0)}</span>
          <div className="flex relative items-center ml-2" style={{ width: 30 }}>
            <Image src="/images/RightCarat.png" layout="fill" objectFit="contain" alt="go" />
          </div>
        </div>
      ))}
    </div>
  );
}
