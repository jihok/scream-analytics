import { ethers } from 'ethers';

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
  cash: string;
}

export interface Market extends Omit<RawMarket, 'underlyingPrice' | 'exchangeRate'> {
  totalSupplyUSD: number;
  totalBorrowsUSD: number;
  underlyingPrice: number;
  exchangeRate: number;
  borrowAPY: number;
  supplyAPY: number;
}

export interface RawMarketDetails extends RawMarket {
  totalInterestAccumulated: string;
  reserveFactor: string;
  collateralFactor: string;
}

export interface MarketDetails extends Market {
  symbol: string;
  totalInterestAccumulated: number;
  reserveFactor: number;
  collateralFactor: number;
}

export function transformMarketData(rawMarkets: RawMarketDetails[]): MarketDetails[];
export function transformMarketData(rawMarkets: RawMarket[]): Market[];
export function transformMarketData(rawMarkets: any): any {
  return rawMarkets.map((rawMarket: any) => ({
    ...rawMarket,
    totalSupplyUSD: +rawMarket.exchangeRate * +rawMarket.totalSupply * +rawMarket.underlyingPrice,
    totalBorrowsUSD: +rawMarket.totalBorrows * +rawMarket.underlyingPrice,
    underlyingPrice: +rawMarket.underlyingPrice,
    exchangeRate: +rawMarket.exchangeRate,
    borrowAPY: +rawMarket.borrowRate * 100,
    supplyAPY: +rawMarket.supplyRate * 100,

    // MarketDetails
    totalInterestAccumulated: +rawMarket.totalInterestAccumulated,
    reserveFactor: rawMarket.reserveFactor
      ? +ethers.utils.formatEther(rawMarket.reserveFactor)
      : undefined,
    collateralFactor: +rawMarket.collateralFactor,

    // TBD
    reserves: +rawMarket.reserves * +rawMarket.underlyingPrice,
  }));
}

export const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const formatAbbrUSD = (value: number) =>
  Math.floor(value / 1_000_000) > 0
    ? `${usdFormatter.format(value / 1_000_000)}M`
    : `${usdFormatter.format(value / 1_000)}K`;
