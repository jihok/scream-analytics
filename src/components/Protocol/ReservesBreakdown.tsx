import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Image from 'next/image';
import { formatAbbrUSD, Market, usdFormatter } from '../../utils/Market';
import { useGlobalContext } from '../../contexts/GlobalContext';
import Link from 'next/link';

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
  sliceValue: number;
  usd?: number;
  id?: string;
}

export default function ReservesBreakdown({
  lastBuybackMarkets,
}: {
  lastBuybackMarkets: Market[];
}) {
  const { todayMarkets } = useGlobalContext();
  const [showCurrent, setShowCurrent] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [sortedData, setSortedData] = useState<ChartData[]>([]);
  const totalReservesUSD = sortedData.reduce((prev, curr) => prev + (curr.usd ?? 0), 0);

  useEffect(() => {
    if (showCurrent) {
      const sorted: ChartData[] = todayMarkets
        .map((market) => ({
          name: market.underlyingSymbol,
          sliceValue:
            (market.reservesUSD /
              todayMarkets.reduce((prev, curr) => prev + (curr.reservesUSD ?? 0), 0)) *
            100,
          usd: market.reservesUSD,
          id: market.id,
        }))
        .sort((a, b) => b.usd - a.usd);
      setSortedData(sorted);

      const data = sorted.slice(0, 6);
      const otherSliceValue = 100 - data.reduce((prev, curr) => prev + curr.sliceValue, 0);
      data.push({
        name: 'Other',
        sliceValue: otherSliceValue,
      });
      setChartData(data);
    } else {
      const sorted: ChartData[] = todayMarkets
        .map((market) => {
          const reservesDiff =
            +(todayMarkets.find((m) => market.id === m.id)?.reserves ?? 0) -
            +(lastBuybackMarkets.find((m) => market.id === m.id)?.reserves ?? 0);
          const marketPrice = +(todayMarkets.find((m) => market.id === m.id)?.underlyingPrice ?? 0);
          return {
            name: market.underlyingSymbol,
            sliceValue: reservesDiff * marketPrice,
            usd: reservesDiff * marketPrice,
            id: market.id,
          };
        })
        .sort((a, b) => b.usd - a.usd);
      setSortedData(sorted);

      const data = sorted.slice(0, 6);
      const other =
        sorted.reduce((prev, curr) => prev + (curr.usd ?? 0), 0) -
        data.reduce((prev, curr) => prev + (curr.usd ?? 0), 0);
      data.push({
        name: 'Other',
        sliceValue: other,
      });
      setChartData(data);
    }
  }, [lastBuybackMarkets, showCurrent, todayMarkets, totalReservesUSD]);

  return (
    <div className="flex flex-col">
      <h2 className="absolute">{usdFormatter(totalReservesUSD)}</h2>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} dataKey="sliceValue" stroke="none">
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
          Accrued Since
          <br />
          Last Buyback
        </p>
      </div>

      {sortedData.map((d, i) => {
        const getValues = () => {
          if (showCurrent) {
            return [`${d.sliceValue.toFixed(2)}%`, d.usd || 0];
          }

          const marketPrice = +(
            todayMarkets.find((market) => market.id === d.id)?.underlyingPrice ?? 0
          );
          const reservesDiff =
            +(todayMarkets.find((market) => market.id === d.id)?.reserves ?? 0) -
            +(lastBuybackMarkets.find((market) => market.id === d.id)?.reserves ?? 0);

          return [
            reservesDiff < 10 ? reservesDiff.toFixed(4) : reservesDiff.toFixed(2),
            reservesDiff * marketPrice,
          ];
        };

        return (
          <Link href={`/market/${d.id}`} key={d.name}>
            <a className="flex mt-2">
              <span className="flex" style={{ minWidth: '40%', maxWidth: '40%' }}>
                <span className="flex">
                  {i < 6 && <span className={`rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-${i}`} />}
                  <span className="text-body">{d.name}</span>
                </span>
                <div className="border-b border-border-secondary w-full self-center mx-2" />
              </span>
              <span className="text-body">{getValues()[0]}</span>
              <div className="border-b border-border-secondary w-full self-center mx-2" />
              <span className="text-body">{formatAbbrUSD(getValues()[1] as number)}</span>
              <div className="flex relative items-center ml-2" style={{ width: 30 }}>
                <Image src="/images/RightCarat.png" layout="fill" objectFit="contain" alt="go" />
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
