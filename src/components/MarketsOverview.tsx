import { useQuery } from '@apollo/client';
import { YESTERDAY_MARKET_QUERY } from '../queries';

type MarketType = 'SUPPLY' | 'BORROW';

interface Market {
  totalSupply: string; // in tokens
  totalBorrows: string; // in tokens
  cash: string; // LIQUIDITY
  id: string;
  symbol: string;
  underlyingPrice: string;
  underlyingSymbol: string;
  exchangeRate: string;
}

interface QueryData {
  markets: Market[];
}

interface Props {
  currentMarkets: Market[];
  currentBlock: number;
}

const BLOCK_TIME = 1000; // we assume blocks are 1s
const BLOCKS_IN_A_DAY = (24 * 60 * 60 * 1000) / BLOCK_TIME;

const getTotalMarketUSD = (markets: Market[], type: MarketType) =>
  markets.reduce(
    (prev, { totalSupply, totalBorrows, exchangeRate, underlyingPrice }) =>
      (type === 'SUPPLY' ? +exchangeRate * +totalSupply : +totalBorrows) *
        +underlyingPrice +
      prev,
    0
  );

const getTopMarketRatios = (
  markets: Market[],
  totalUSD: number,
  type: MarketType
) =>
  markets
    .map(
      ({
        underlyingSymbol,
        exchangeRate,
        totalSupply,
        totalBorrows,
        underlyingPrice,
      }) => ({
        symbol: underlyingSymbol,
        valUSD:
          (type === 'SUPPLY' ? +exchangeRate * +totalSupply : +totalBorrows) *
          +underlyingPrice,
      })
    )
    .sort((a, b) => b.valUSD - a.valUSD)
    .slice(0, 3)
    .map((market) => ({
      symbol: market.symbol,
      percentage: (market.valUSD / totalUSD) * 100,
    }));

const MarketsOverview = ({ currentMarkets, currentBlock }: Props) => {
  const yesterdayBlock = currentBlock - BLOCKS_IN_A_DAY;
  console.log('yesterday', yesterdayBlock);
  const { loading, error, data } = useQuery<QueryData>(YESTERDAY_MARKET_QUERY, {
    variables: {
      yesterdayBlock,
      todayBlock: currentBlock,
    },
  });

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const { yesterday, today } = data;
  const yesterdaySupplyUSD = getTotalMarketUSD(yesterday, 'SUPPLY');
  const todaySupplyUSD = getTotalMarketUSD(currentMarkets, 'SUPPLY');
  console.log(yesterdaySupplyUSD);

  // const yesterdayBorrowUSD = getTotalMarketUSD(yesterday, 'BORROW');
  const todayBorrowUSD = getTotalMarketUSD(currentMarkets, 'BORROW');

  const todaySupplyRatios = getTopMarketRatios(
    currentMarkets,
    todaySupplyUSD,
    'SUPPLY'
  );
  todaySupplyRatios.push({
    symbol: 'Others',
    percentage:
      100 - todaySupplyRatios.reduce((prev, curr) => curr.percentage + prev, 0),
  });

  const todayBorrowRatios = getTopMarketRatios(
    currentMarkets,
    todayBorrowUSD,
    'BORROW'
  );
  todayBorrowRatios.push({
    symbol: 'Others',
    percentage:
      100 - todayBorrowRatios.reduce((prev, curr) => curr.percentage + prev, 0),
  });

  return (
    <div style={{ display: 'flex' }}>
      <div>
        Total Supply: ${(+todaySupplyUSD.toFixed(2)).toLocaleString()}
        {todaySupplyRatios.map((t) => (
          <div key={t.symbol}>
            {t.symbol} {t.percentage.toFixed(2)} %
          </div>
        ))}
      </div>
      <div>
        Total Borrow: ${(+todayBorrowUSD.toFixed(2)).toLocaleString()}
        {todayBorrowRatios.map((t) => (
          <div key={t.symbol}>
            {t.symbol} {t.percentage.toFixed(2)} %
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketsOverview;
