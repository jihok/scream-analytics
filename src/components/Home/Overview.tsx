import { useGlobalContext } from '../../contexts/GlobalContext';
import { usdFormatter, Market } from '../../utils/Market';
import PercentChange from '../PercentChange';

interface MarketRatio extends Market {
  percentage: number;
  colorIndex: number;
}

export default function MarketsOverview() {
  const { yesterdayMarkets, todayMarkets } = useGlobalContext();
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
    <div className="flex bg-darkGray rounded-md shadow-3xl flex-col lg:flex-row w-full justify-center">
      <div className="w-full border-border-primary border-b lg:border-b-0 lg:border-r px-5 lg:px-5 py-5 lg:py-0 lg:my-5">
        <div className="flex justify-between pb-4">
          <div>
            <p className="font-sans-semibold">Total Supply</p>
            <PercentChange yesterdayVal={yesterdaySupplyUSD} todayVal={todaySupplyUSD} />
          </div>
          <h1 className="font-sans-light">{usdFormatter(todaySupplyUSD)}</h1>
        </div>
        <MarketRatioBar marketRatios={supplyRatios} />
      </div>
      <div className="w-full px-5 my-5">
        <div className="flex justify-between pb-4">
          <div>
            <p className="font-sans-semibold">Total Borrow</p>
            <PercentChange yesterdayVal={yesterdayBorrowUSD} todayVal={todayBorrowUSD} />
          </div>
          <h1 className="font-sans-light">{usdFormatter(todayBorrowUSD)}</h1>
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
  <div className="flex">
    {props.marketRatios.map(({ percentage, underlyingSymbol, colorIndex }, i) => (
      <div key={underlyingSymbol} style={{ width: `${percentage}%` }}>
        <div
          className={`bg-bar-${colorIndex} w-full h-8`}
          style={{ borderRadius: getBorderRadius(i) }}
        />
        <div className="flex mt-2">
          <div className={`rounded-full h-2 w-2 mr-1 mt-0.5 bg-bar-${colorIndex}`} />
          <div className="flex-col label-body">
            <div className="font-sans-semibold">{underlyingSymbol}</div>
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
