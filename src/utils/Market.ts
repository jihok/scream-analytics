export interface RawMarket {
  totalSupply: string; // in tokens
  totalBorrows: string; // in tokens
  underlyingPrice: string;
  underlyingSymbol: string;
  underlyingName: string;
  exchangeRate: string;
  borrowRate: string;
  supplyRate: string;
  id: string;
}

export interface Market extends Omit<RawMarket, 'underlyingPrice' | 'exchangeRate'> {
  totalSupplyUSD: number;
  totalBorrowsUSD: number;
  underlyingPrice: number;
  exchangeRate: number;
  borrowAPY: number;
  supplyAPY: number;
}

export const transformData = (rawMarkets: RawMarket[]): Market[] => {
  return rawMarkets.map((rawMarket) => ({
    ...rawMarket,
    totalSupplyUSD: +rawMarket.exchangeRate * +rawMarket.totalSupply * +rawMarket.underlyingPrice,
    totalBorrowsUSD: +rawMarket.totalBorrows * +rawMarket.underlyingPrice,
    underlyingPrice: +rawMarket.underlyingPrice,
    exchangeRate: +rawMarket.exchangeRate,
    borrowAPY: +rawMarket.borrowRate * 100,
    supplyAPY: +rawMarket.supplyRate * 100,
  }));
};

export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatAbbrUSD = (value: number) =>
  Math.floor(value / 1_000_000) > 0
    ? `${usdFormatter.format(value / 1_000_000)}M`
    : `${usdFormatter.format(value / 1_000)}K`;
