import { useRouter } from 'next/router';
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import Layout from '../src/components/Layout';
import { useMarketContext } from '../src/contexts/MarketContext';

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

export default function ProtocolOverview() {
  const { todayMarkets } = useMarketContext();
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
    <Layout home="protocol">
      <div className="lg:px-10">
        <h1 className="pb-6 border-border-primary border-b m-5 lg:hidden">Protocol Overview</h1>
        <div className="flex flex-col p-4 bg-darkGray shadow-3xl" style={{ height: 500 }}>
          <h3 className="pb-3 mb-3 border-b border-border-secondary">Scream Price</h3>
          <iframe
            loading="lazy"
            width="100%"
            height="100%"
            src="https://kek.tools/t/0xe0654c8e6fd4d733349ac7e09f6f23da256bf475/chart?pair=0x30872e4fc4edbfd7a352bfc2463eb4fae9c09086&currencyType=native&accent=off"
            scrolling="no"
          ></iframe>
        </div>
        <div className="flex flex-col p-4 bg-darkGray shadow-3xl">
          <h3 className="pb-3 mb-3 border-b border-border-secondary">Reserves Breakdown</h3>
          <div className="flex flex-col">
            <PieChart width={300} height={300}>
              <Pie data={chartData} dataKey="percent">
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>

            <div className="flex flex-col">
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
            </div>

            <div className="flex flex-col">
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
