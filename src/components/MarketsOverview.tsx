import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { MARKET_QUERY } from '../queries';

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
  today: Market[];
}

interface Props {
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

const MarketsOverview = ({ currentBlock }: Props) => {
  const { loading, error, data } = useQuery<QueryData>(MARKET_QUERY, {
    variables: { yesterday: currentBlock - BLOCKS_IN_A_DAY },
  });

  if (loading || !data) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  console.log('current block: ', currentBlock);

  const { yesterday, today } = data;
  console.log('data', data);
  console.log('yesterday', yesterday);
  console.log('today', today);
  const yesterdaySupplyUSD = getTotalMarketUSD(yesterday, 'SUPPLY');
  const todaySupplyUSD = getTotalMarketUSD(today, 'SUPPLY');

  const yesterdayBorrowUSD = getTotalMarketUSD(yesterday, 'BORROW');
  const todayBorrowUSD = getTotalMarketUSD(today, 'BORROW');

  const todaySupplyRatios = getTopMarketRatios(today, todaySupplyUSD, 'SUPPLY');
  todaySupplyRatios.push({
    symbol: 'Others',
    percentage:
      100 - todaySupplyRatios.reduce((prev, curr) => curr.percentage + prev, 0),
  });

  const todayBorrowRatios = getTopMarketRatios(today, todayBorrowUSD, 'BORROW');
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
