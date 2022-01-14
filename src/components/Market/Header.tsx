import React from 'react';
import { usdFormatter, formatAbbrUSD } from '../../utils/Market';
import Image from 'next/image';
import PercentChange from '../PercentChange';
import { MarketPageProps } from '../../../pages/market/[id]';
import ValueWithLabel from '../ValueWithLabel';

export default function MarketHeader({ yesterday, market }: MarketPageProps) {
  return (
    <div className="pb-12 flex flex-col lg:flex-row lg:justify-between">
      {/* asset name and price */}
      <div className="flex flex-row justify-between lg:flex-col">
        <div className="flex flex-row">
          <div style={{ width: 33, position: 'relative' }}>
            <Image
              src={`/images/tokens/${market.underlyingSymbol.toLowerCase()}.png`}
              layout="fill"
              objectFit="contain"
              alt={market.underlyingSymbol}
            />
          </div>
          <div className="ml-3 lg:ml-5">
            <span className="lg:flex lg:flex-row-reverse lg:justify-end lg:items-baseline">
              <p className="lg:ml-2">{market.underlyingSymbol}</p>
              <p className="font-sans-semibold text-title">{market.underlyingName}</p>
            </span>
            <h1 className="font-sans-light hidden lg:block">
              {usdFormatter.format(market.underlyingPrice)}
            </h1>
          </div>
        </div>
        <h1 className="font-sans-light lg:hidden">{usdFormatter.format(market.underlyingPrice)}</h1>
      </div>

      {/* mutable asset metrics */}
      <div className="flex justify-between px-16 lg:px-0 mt-7 lg:mt-1">
        <ValueWithLabel
          label="Supplied"
          type="dollars"
          value={market.totalSupplyUSD}
          yesterdayValue={yesterday.totalSupplyUSD}
          className="pr-6"
        />
        <ValueWithLabel
          label="Borrowed"
          type="dollars"
          value={market.totalBorrowsUSD}
          yesterdayValue={yesterday.totalBorrowsUSD}
          className="pr-6"
        />
        <ValueWithLabel
          label="Utilization"
          type="percent"
          value={market.totalBorrowsUSD / market.totalSupplyUSD}
          yesterdayValue={yesterday.totalBorrowsUSD / yesterday.totalSupplyUSD}
          className="pr-6"
        />
        <ValueWithLabel
          label="Liquidity"
          type="dollars"
          value={+market.cash}
          yesterdayValue={+yesterday.cash}
        />
      </div>
    </div>
  );
}
