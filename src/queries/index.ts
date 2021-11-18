import { gql } from '@apollo/client';

export const LATEST_BLOCK_QUERY = gql`
  query {
    _meta {
      block {
        number
      }
    }
  }
`;

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
