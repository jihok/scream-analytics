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

export interface Market {
  totalSupply: string; // in tokens
  totalBorrows: string; // in tokens
  underlyingPrice: string;
  underlyingSymbol: string;
  underlyingName: string;
  exchangeRate: string;
  borrowRate: string;
  supplyRate: string;
}

export interface YesterdayTodayMarketsQuery {
  yesterday: Market[];
  today: Market[];
}

export const YESTERDAY_TODAY_MARKETS_QUERY = gql`
  query YesterdayTodayMarkets($yesterdayBlock: Int!, $todayBlock: Int!) {
    yesterday: markets(block: { number: $yesterdayBlock }) {
      totalSupply
      totalBorrows
      underlyingPrice
      underlyingSymbol
      underlyingName
      exchangeRate
      borrowRate
      supplyRate
    }
    today: markets(block: { number: $todayBlock }) {
      totalSupply
      totalBorrows
      underlyingPrice
      underlyingSymbol
      underlyingName
      exchangeRate
      borrowRate
      supplyRate
    }
  }
`;
