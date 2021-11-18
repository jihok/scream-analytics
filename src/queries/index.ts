import { gql } from '@apollo/client';
import { RawMarket } from '../utils/Market';

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

export interface YesterdayTodayMarkets {
  yesterday: RawMarket[];
  today: RawMarket[];
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
