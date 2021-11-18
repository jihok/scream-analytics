import { gql } from '@apollo/client';

export const CURRENT_BLOCK_QUERY = gql`
  query {
    _meta {
      block {
        number
      }
    }
  }
`;

export const YESTERDAY_MARKET_QUERY = gql`
  query YesterdayTodayMarkets($yesterdayBlock: Int!) {
    yesterday: markets(block: { number: $yesterdayBlock }) {
      totalSupply
      totalBorrows
      underlyingPrice
      underlyingSymbol
      exchangeRate
    }
  }
`;
