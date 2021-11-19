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

export interface YesterdayTodayMarketsQuery {
  yesterday: RawMarket[];
  today: RawMarket[];
}

export const YESTERDAY_TODAY_MARKETS_QUERY = gql`
  query YesterdayTodayMarkets($yesterdayBlock: Int!, $todayBlock: Int!) {
    yesterday: markets(block: { number: $yesterdayBlock }, where: { totalSupply_gt: 0 }) {
      totalSupply
      totalBorrows
      underlyingPrice
      underlyingSymbol
      underlyingName
      exchangeRate
      borrowRate
      supplyRate
    }
    today: markets(block: { number: $todayBlock }, where: { totalSupply_gt: 0 }) {
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
  query AssetQuery($id: String!, $blockNumber: Int!) {
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
