export interface RawMarket {
  totalSupply: string; // in tokens
  totalBorrows: string; // in tokens
  underlyingPrice: string;
  underlyingSymbol: string;
  underlyingName: string;
  exchangeRate: string;
  borrowRate: string;
  supplyRate: string;
}

export interface Market {
  totalSupplyUSD: number;
  totalBorrowsUSD: number;
  underlyingPrice: number;
  underlyingSymbol: string;
  underlyingName: string;
  exchangeRate: number;
  borrowRate: number;
  supplyRate: number;
}

type MarketType = 'SUPPLY' | 'BORROW';

const getMarketUSD = (
  { totalSupply, totalBorrows, exchangeRate, underlyingPrice }: RawMarket,
  type: MarketType
) => (type === 'SUPPLY' ? +exchangeRate * +totalSupply : +totalBorrows) * +underlyingPrice;

export const transformData = (rawMarkets: RawMarket[]) => {
  return rawMarkets.map((rawMarket) => ({
    ...rawMarket,
    totalSupplyUSD: getMarketUSD(rawMarket, 'SUPPLY'),
    totalBorrowsUSD: getMarketUSD(rawMarket, 'BORROW'),
    underlyingPrice: +rawMarket.underlyingPrice,
    exchangeRate: +rawMarket.exchangeRate,
    borrowRate: +rawMarket.borrowRate,
    supplyRate: +rawMarket.supplyRate,
  }));
};
