import { usdFormatter, Market } from '../utils/Market';

interface Props {
  yesterday: Market[];
  today: Market[];
}

interface MarketRatio extends Market {
  percentage: number;
}

export default function MarketsOverview({ yesterday, today }: Props) {
  const yesterdaySupplyUSD = yesterday.reduce((prev, curr) => curr.totalSupplyUSD + prev, 0);
  const yesterdayBorrowUSD = yesterday.reduce((prev, curr) => curr.totalBorrowsUSD + prev, 0);
  const todaySupplyUSD = today.reduce((prev, curr) => curr.totalSupplyUSD + prev, 0);
  const todayBorrowUSD = today.reduce((prev, curr) => curr.totalBorrowsUSD + prev, 0);

  const supplyRatios: MarketRatio[] = today
    .sort((a, b) => b.totalSupplyUSD - a.totalSupplyUSD)
    .slice(0, 3)
    .map((market) => ({
      ...market,
      percentage:
        (market.totalSupplyUSD / today.reduce((prev, curr) => curr.totalSupplyUSD + prev, 0)) * 100,
    }));
  supplyRatios.push({
    underlyingSymbol: 'Others',
    percentage: 100 - supplyRatios.reduce((prev, curr) => curr.percentage + prev, 0),
  } as MarketRatio);

  const borrowRatios = today
    .sort((a, b) => b.totalBorrowsUSD - a.totalBorrowsUSD)
    .slice(0, 3)
    .map((market) => ({
      ...market,
      percentage:
        (market.totalBorrowsUSD / today.reduce((prev, curr) => curr.totalBorrowsUSD + prev, 0)) *
        100,
    }));
  borrowRatios.push({
    underlyingSymbol: 'Others',
    percentage: 100 - borrowRatios.reduce((prev, curr) => curr.percentage + prev, 0),
  } as MarketRatio);

  return (
    <div style={{ display: 'flex' }}>
      <div>
        Total Supply: {usdFormatter.format(todaySupplyUSD)}
        <MarketRatioBar marketRatios={supplyRatios} />
        <br />
        24h supply volume: {usdFormatter.format(todaySupplyUSD - yesterdaySupplyUSD)}
      </div>
      <div>
        Total Borrow: {usdFormatter.format(todayBorrowUSD)}
        <MarketRatioBar marketRatios={borrowRatios} />
        <br />
        24h borrow volume: {usdFormatter.format(todayBorrowUSD - yesterdayBorrowUSD)}
      </div>
    </div>
  );
}

const BAR_COLORS = ['red', 'orange', 'yellow', 'green'];
const MarketRatioBar = (props: { marketRatios: MarketRatio[] }) => (
  <div style={{ display: 'flex', width: '100%', height: 10 }}>
    {props.marketRatios.map(({ percentage, underlyingSymbol }, i) => (
      <div key={underlyingSymbol} style={{ width: `${percentage}%`, height: '100%' }}>
        <div style={{ backgroundColor: BAR_COLORS[i], width: `100%`, height: '100%' }} />
        <div style={{ position: 'absolute' }}>
          {underlyingSymbol} {percentage.toFixed(2)}%
        </div>
      </div>
    ))}
  </div>
);
