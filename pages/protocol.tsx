import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import Layout from '../src/components/Layout';
import { useMarketContext } from '../src/contexts/MarketContext';

// TODO: shareable with tailwind.config?
const COLORS = [
  '#89DFDB',
  '#F4BBD1',
  '#F7C893',
  '#F1DC75',
  '#CBC6FB',
  '#12ADA6',
  '#4F4F50', // 'other' color
];

export default function ProtocolOverview() {
  const { todayMarkets } = useMarketContext();

  const totalReservesUSD = todayMarkets.reduce((prev, curr) => prev + curr.reserves, 0);
  const data = todayMarkets
    .map((market) => ({
      name: market.underlyingSymbol,
      percent: (market.reserves / totalReservesUSD) * 100,
    }))
    .sort((a, b) => b.percent - a.percent);
  const chartData = data.slice(0, 6);
  const otherPercent = 100 - chartData.reduce((prev, curr) => prev + curr.percent, 0);
  chartData.push({
    name: 'Other',
    percent: otherPercent,
  });

  console.log(totalReservesUSD, data);

  return (
    <Layout home="protocol">
      <div className="lg:px-10">
        <h1 className="font-sans-semibold pb-6 border-border-primary border-b m-5 lg:hidden">
          Protocol Overview
        </h1>
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
          <div className="flex justify-between">
            <div className="flex flex-col">
              {data.slice(0, 6).map((d, i) => (
                <div className="flex mt-2" key={d.name}>
                  <div className={`rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-${i}`} />
                  <div className="flex-col text-caption">
                    <div className="font-sans-semibold">{d.name}</div>
                    {d.percent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>

            <ResponsiveContainer width={215} height={215}>
              <PieChart>
                <Pie cy={100} data={chartData} dataKey="percent">
                  {chartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col">
              <div className="flex mt-2">
                <div className="rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-6" />
                <div className="flex-col text-caption pb-2 border-b border-border-primary">
                  <div className="font-sans-semibold">Other</div>
                  {otherPercent.toFixed(2)}%
                </div>
              </div>
              {data.slice(6, 10).map((d) => (
                <div className="flex mt-2 pl-3" key={d.name}>
                  <div className="flex-col text-caption">
                    <div className="font-sans-semibold">{d.name}</div>
                    {d.percent.toFixed(2)}%
                  </div>
                </div>
              ))}
              <div className="text-caption pt-2 pl-3">+ {data.length - 10} more</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
