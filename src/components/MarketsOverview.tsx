import { MarketBase } from '../queries';

type MarketType = 'SUPPLY' | 'BORROW';

interface Props {
  yesterday: MarketBase[];
  today: MarketBase[];
}

interface MarketRatio {
  symbol: string;
  percentage: number;
  valUSD?: number;
}

const getTotalMarketUSD = (markets: MarketBase[], type: MarketType) =>
  markets.reduce(
    (prev, { totalSupply, totalBorrows, exchangeRate, underlyingPrice }) =>
      (type === 'SUPPLY' ? +exchangeRate * +totalSupply : +totalBorrows) * +underlyingPrice + prev,
    0
  );

/**
 * Transforms given markets into an array of the market's underlying symbols with their USD value.
 * The top 3 markets by USD value are then returned with their respective ratio of all markets.
 * @param markets markets to include in the top markets calculation.
 * @param totalUSD USD value of all markets.
 * @param type indicates whether the markets are supply or borrow to inform the USD value calculation.
 */
const getTopMarketRatios = (
  markets: MarketBase[],
  totalUSD: number,
  type: MarketType
): MarketRatio[] =>
  markets
    .map(({ underlyingSymbol, exchangeRate, totalSupply, totalBorrows, underlyingPrice }) => ({
      symbol: underlyingSymbol,
      valUSD: (type === 'SUPPLY' ? +exchangeRate * +totalSupply : +totalBorrows) * +underlyingPrice,
    }))
    .sort((a, b) => b.valUSD - a.valUSD)
    .slice(0, 3)
    .map((market) => ({
      ...market,
      percentage: (market.valUSD / totalUSD) * 100,
    }));

export default function MarketsOverview({ yesterday, today }: Props) {
  const yesterdaySupplyUSD = getTotalMarketUSD(yesterday, 'SUPPLY');
  const yesterdayBorrowUSD = getTotalMarketUSD(yesterday, 'BORROW');
  const todaySupplyUSD = getTotalMarketUSD(today, 'SUPPLY');
  const todayBorrowUSD = getTotalMarketUSD(today, 'BORROW');

  const todaySupplyRatios = getTopMarketRatios(today, todaySupplyUSD, 'SUPPLY');
  todaySupplyRatios.push({
    symbol: 'Others',
    percentage: 100 - todaySupplyRatios.reduce((prev, curr) => curr.percentage + prev, 0),
  });

  const todayBorrowRatios = getTopMarketRatios(today, todayBorrowUSD, 'BORROW');
  todayBorrowRatios.push({
    symbol: 'Others',
    percentage: 100 - todayBorrowRatios.reduce((prev, curr) => curr.percentage + prev, 0),
  });

  return (
    <div style={{ display: 'flex' }}>
      <div>
        Total Supply: ${(+todaySupplyUSD.toFixed(2)).toLocaleString()}
        <MarketRatioBar marketRatios={todaySupplyRatios} />
        <br />
        24h supply volume: {(+(todaySupplyUSD - yesterdaySupplyUSD).toFixed(2)).toLocaleString()}
      </div>
      <div>
        Total Borrow: ${(+todayBorrowUSD.toFixed(2)).toLocaleString()}
        <MarketRatioBar marketRatios={todayBorrowRatios} />
        <br />
        24h borrow volume: {(+(todayBorrowUSD - yesterdayBorrowUSD).toFixed(2)).toLocaleString()}
      </div>
    </div>
  );
}

const BAR_COLORS = ['red', 'orange', 'yellow', 'green'];
const MarketRatioBar = (props: { marketRatios: MarketRatio[] }) => (
  <div style={{ display: 'flex', width: '100%', height: 10 }}>
    {props.marketRatios.map(({ percentage, symbol }, i) => (
      <div key={symbol} style={{ width: `${percentage}%`, height: '100%' }}>
        <div style={{ backgroundColor: BAR_COLORS[i], width: `100%`, height: '100%' }} />
        <div style={{ position: 'absolute' }}>
          {symbol} {percentage.toFixed(2)} %
        </div>
      </div>
    ))}
  </div>
);
