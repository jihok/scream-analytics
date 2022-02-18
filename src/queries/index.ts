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

// might be able to do this in a type safe way that links to defined interfaces
const MARKET_BASE_VARS = `
borrowRate
cash
exchangeRate
id
reserves
supplyRate
totalBorrows
totalSupply
underlyingPrice
`;

/**
 * query for market overview data.
 * this fetches snapshot of markets currently + yesterday for the MarketContext
 * @returns RawMarket
 */
export const MARKETS_BY_BLOCK_QUERY = gql`
  query MarketsByBlock($blockNumber: Int!) {
    markets(block: { number: $blockNumber }, where: { totalSupply_gt: 0 }) {
      ${MARKET_BASE_VARS}
      underlyingSymbol
      underlyingName
    }
  }
`;

/**
 * query for data to make historical utilization charts.
 * keep this lean as this query will be sent up to 30 times (1 month) at a time
 * @returns RawMarketBase
 */
export const MARKET_BASE_BY_BLOCK_QUERY = gql`
  query MarketBaseByBlock($id: String!, $blockNumber: Int!) {
    markets(block: { number: $blockNumber }, where: { id: $id }) {
      ${MARKET_BASE_VARS}
    }
  }
`;

/**
 * query for full market details.
 * @returns RawMarketDetails
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

/**
 * query account details.
 * TODO: we should be able to match market against an existing map of Markets that we store in GlobalContext instead of fetching here
 * @returns RawAccount
 */
export const ACCOUNT_QUERY = gql`
  query Account($id: String!) {
    accounts(where: { id: $id }) {
      id
      countLiquidated
      countLiquidator
      tokens {
        symbol
        cTokenBalance
        totalUnderlyingSupplied
        totalUnderlyingRedeemed
        totalUnderlyingBorrowed
        totalUnderlyingRepaid
        storedBorrowBalance
        accountBorrowIndex
        market {
          ${MARKET_BASE_VARS}
          collateralFactor
          borrowIndex
          underlyingSymbol
          underlyingName
        }
      }
    }
  }
`;
