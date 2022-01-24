import { useRouter } from 'next/router';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useMarketContext } from '../../contexts/MarketContext';
import Image from 'next/image';
import { formatAbbrUSD, Market, usdFormatter } from '../../utils/Market';

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

export default function ReservesBreakdown({
  lastBuybackMarkets,
}: {
  lastBuybackMarkets: Market[];
}) {
  const { todayMarkets } = useMarketContext();
  const [showCurrent, setShowCurrent] = useState(true);
  const router = useRouter();

  // aggregate minority assets into Other for pie chart
  const totalReservesUSD = todayMarkets.reduce((prev, curr) => prev + curr.reservesUSD, 0);
  const currentData: ChartData[] = todayMarkets
    .map((market) => ({
      name: market.underlyingSymbol,
      percent: (market.reservesUSD / totalReservesUSD) * 100,
      usd: market.reservesUSD,
      id: market.id,
    }))
    .sort((a, b) => b.percent - a.percent);
  const chartData: ChartData[] = currentData.slice(0, 6);
  const otherPercent = 100 - chartData.reduce((prev, curr) => prev + curr.percent, 0);
  chartData.push({
    name: 'Other',
    percent: otherPercent,
  });

  const renderData = (d: ChartData, i: number) => {
    const marketPrice = +(todayMarkets.find((market) => market.id === d.id)?.underlyingPrice ?? 0);
    const reservesDiff =
      +(todayMarkets.find((market) => market.id === d.id)?.reserves ?? 0) -
      +(lastBuybackMarkets.find((market) => market.id === d.id)?.reserves ?? 0);

    return (
      <div
        className="flex mt-2 cursor-pointer"
        key={d.name}
        onClick={async () => await router.push(`/market/${d.id}`)}
      >
        <span className="flex">
          {i < 6 && <span className={`rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-${i}`} />}
          <span className="text-body">{d.name}</span>
        </span>
        <div className="border-b border-border-secondary w-full self-center mx-2" />
        <span className="text-body">{showCurrent ? `${d.percent.toFixed(2)}%` : reservesDiff}</span>
        <div className="border-b border-border-secondary w-full self-center mx-2" />
        <span className="text-body">
          {formatAbbrUSD(showCurrent ? d.usd || 0 : reservesDiff * marketPrice)}
        </span>
        <div className="flex relative items-center ml-2" style={{ width: 30 }}>
          <Image src="/images/RightCarat.png" layout="fill" objectFit="contain" alt="go" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <h2 className="absolute">{usdFormatter.format(totalReservesUSD)}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} dataKey="percent" stroke="none">
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <div className="flex text-center mb-4">
        <p
          className={`${
            showCurrent
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pt-2 pb-3 cursor-pointer`}
          onClick={() => setShowCurrent(true)}
        >
          Current
        </p>
        <p
          className={`${
            !showCurrent
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pb-3 cursor-pointer`}
          onClick={() => setShowCurrent(false)}
        >
          Accrued Since Buyback
        </p>
      </div>

      {currentData.map(renderData)}
    </div>
  );
}
