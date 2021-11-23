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

export const MARKETS_BY_BLOCK_QUERY = gql`
  query MarketsByBlock($blockNumber: Int!) {
    markets(block: { number: $blockNumber }, where: { totalSupply_gt: 0 }) {
      totalSupply
      totalBorrows
      underlyingPrice
      underlyingSymbol
      underlyingName
      exchangeRate
      borrowRate
      supplyRate
      id
    }
  }
`;

export const ASSET_BY_BLOCK_QUERY = gql`
  query AssetByBlock($id: String!, $blockNumber: Int!) {
    markets(block: { number: $blockNumber }, where: { id: $id }) {
      totalSupply
      totalBorrows
      borrowRate
      supplyRate
      exchangeRate
      underlyingPrice
    }
  }
`;
