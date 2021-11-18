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

export const MARKET_QUERY = gql`
  query market($yesterday: Int!) {
    today: markets {
      totalSupply
      totalBorrows
      cash
      id
      symbol
      underlyingPrice
      underlyingSymbol
      exchangeRate
    }
    yesterday: markets(block: { number: $yesterday }) {
      totalSupply
      totalBorrows
      cash
      id
      symbol
      underlyingPrice
      underlyingSymbol
      exchangeRate
    }
  }
`;
