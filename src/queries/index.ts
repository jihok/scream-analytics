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

const MARKET_BASE_VARS = `
totalSupply
totalBorrows
borrowRate
supplyRate
exchangeRate
underlyingPrice
`;

/**
 * query for market overview data.
 * this fetches snapshot of markets currently + yesterday for the MarketContext
 */
export const MARKETS_BY_BLOCK_QUERY = gql`
  query MarketsByBlock($blockNumber: Int!) {
    markets(block: { number: $blockNumber }, where: { totalSupply_gt: 0 }) {
      ${MARKET_BASE_VARS}
      underlyingSymbol
      underlyingName
      id
    }
  }
`;

/**
 * query for data to make historical utilization charts.
 * keep this lean as this query will be sent up to 30 times (1 month) at a time
 */
export const MARKET_BASE_BY_BLOCK_QUERY = gql`
  query MarketBaseByBlock($id: String!, $blockNumber: Int!) {
    markets(block: { number: $blockNumber }, where: { id: $id }) {
      ${MARKET_BASE_VARS}
      reserves
    }
  }
`;

/**
 * query for full market details.
 */
export const MARKET_DETAILS_QUERY = gql`
  query MarketDetails($id: String!) {
    markets(where: { id: $id }) {
      ${MARKET_BASE_VARS}
      totalInterestAccumulated
      reserveFactor
      collateralFactor
      symbol
      underlyingName
      underlyingSymbol
    }
  }
`;
