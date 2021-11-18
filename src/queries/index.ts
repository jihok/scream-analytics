import { gql } from '@apollo/client';

export interface LatestBlockQuery {
  _meta: {
    block: {
      number: number;
    };
  };
}

export const LATEST_BLOCK_QUERY = gql`
  query {
    _meta {
      block {
        number
      }
    }
  }
`;

export interface MarketBase {
  totalSupply: string; // in tokens
  totalBorrows: string; // in tokens
  underlyingPrice: string;
  underlyingSymbol: string;
  exchangeRate: string;
}

export interface YesterdayTodayMarketsQuery {
  yesterday: MarketBase[];
  today: MarketBase[];
}

export const YESTERDAY_TODAY_MARKET_QUERY = gql`
  query YesterdayTodayMarkets($yesterdayBlock: Int!, $todayBlock: Int!) {
    yesterday: markets(block: { number: $yesterdayBlock }) {
      totalSupply
      totalBorrows
      underlyingPrice
      underlyingSymbol
      exchangeRate
    }
    today: markets(block: { number: $todayBlock }) {
      totalSupply
      totalBorrows
      underlyingPrice
      underlyingSymbol
      exchangeRate
    }
  }
`;
