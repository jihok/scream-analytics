import { useMarketContext } from '../contexts/MarketContext';
import { usdFormatter, Market } from '../utils/Market';

interface MarketRatio extends Market {
  percentage: number;
  colorIndex: number;
}

export default function MarketsOverview() {
  const { yesterdayMarkets, todayMarkets } = useMarketContext();
  const yesterdaySupplyUSD = yesterdayMarkets.reduce((prev, curr) => curr.totalSupplyUSD + prev, 0);
  const yesterdayBorrowUSD = yesterdayMarkets.reduce(
    (prev, curr) => curr.totalBorrowsUSD + prev,
    0
  );
  const todaySupplyUSD = todayMarkets.reduce((prev, curr) => curr.totalSupplyUSD + prev, 0);
  const todayBorrowUSD = todayMarkets.reduce((prev, curr) => curr.totalBorrowsUSD + prev, 0);

  const supplyRatios: MarketRatio[] = todayMarkets
    .sort((a, b) => b.totalSupplyUSD - a.totalSupplyUSD)
    .slice(0, 3)
    .map((market, i) => ({
      ...market,
      percentage:
        (market.totalSupplyUSD /
          todayMarkets.reduce((prev, curr) => curr.totalSupplyUSD + prev, 0)) *
        100,
      colorIndex: i,
    }));
  supplyRatios.push({
    underlyingSymbol: 'Others',
    percentage: 100 - supplyRatios.reduce((prev, curr) => curr.percentage + prev, 0),
    colorIndex: 6,
  } as MarketRatio);

  const borrowRatios = todayMarkets
    .sort((a, b) => b.totalBorrowsUSD - a.totalBorrowsUSD)
    .slice(0, 3)
    .map((market, i) => ({
      ...market,
      percentage:
        (market.totalBorrowsUSD /
          todayMarkets.reduce((prev, curr) => curr.totalBorrowsUSD + prev, 0)) *
        100,

      // if market is also in top of supply, match color. Otherwise find a new color
      colorIndex:
        supplyRatios.find((supplyRatio) => supplyRatio.id === market.id)?.colorIndex ?? 3 + i,
    }));
  borrowRatios.push({
    underlyingSymbol: 'Others',
    percentage: 100 - borrowRatios.reduce((prev, curr) => curr.percentage + prev, 0),
    colorIndex: 6,
  } as MarketRatio);

  return (
    <div className="flex py-5 bg-darkGray self-center rounded-md shadow-lg">
      <div className="border-r border-border px-4">
        <div className="flex justify-between pb-4">
          <div>
            <h3>Total Supply</h3>
            {usdFormatter.format(todaySupplyUSD - yesterdaySupplyUSD)}
          </div>
          <h1>{usdFormatter.format(todaySupplyUSD)}</h1>
        </div>
        <MarketRatioBar marketRatios={supplyRatios} />
      </div>
      <div className="px-4">
        <div className="flex justify-between pb-4">
          <div>
            <h3>Total Borrow</h3>
            {usdFormatter.format(todayBorrowUSD - yesterdayBorrowUSD)}
          </div>
          <h1>{usdFormatter.format(todayBorrowUSD)}</h1>
        </div>
        <MarketRatioBar marketRatios={borrowRatios} />
      </div>
    </div>
  );
}

/**
 *
 * @param props top 3 markets with their ratios
 * @returns
 */
const MarketRatioBar = (props: { marketRatios: MarketRatio[] }) => (
  <div className="flex h-8">
    {props.marketRatios.map(({ percentage, underlyingSymbol, colorIndex }, i) => (
      <div key={underlyingSymbol} style={{ width: `${percentage}%` }}>
        <div
          className={`bg-bar-${colorIndex} w-full h-full`}
          style={{ borderRadius: getBorderRadius(i) }}
        />
        <div className="flex mt-2">
          <div className={`rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-${colorIndex}`} />
          <div className="flex-col text-caption">
            <div className="font-semibold">{underlyingSymbol}</div>
            {percentage.toFixed(2)}%
          </div>
        </div>
      </div>
    ))}
  </div>
);

const getBorderRadius = (i: number) => {
  if (i === 0) return '50px 0px 0px 50px';
  if (i === 3) return '0px 50px 50px 0px';
  return '';
};
