import React from 'react';
import { usdFormatter, formatAbbrUSD } from '../../utils/Market';
import Image from 'next/image';
import PercentChange from '../PercentChange';
import { MarketPageProps } from '../../../pages/market/[id]';

export default function MarketHeader({ yesterday, market }: MarketPageProps) {
  return (
    <div className="pb-8 flex flex-col lg:flex-row lg:justify-between">
      {/* asset name and price */}
      <div className="flex flex-row justify-between lg:flex-col">
        <div className="flex flex-row">
          <div style={{ width: 33, position: 'relative' }}>
            <Image
              src={`/images/${market.underlyingSymbol}.png`}
              layout="fill"
              objectFit="contain"
              alt={market.underlyingSymbol}
            />
          </div>
          <div className="ml-3 lg:ml-5">
            <span className="lg:flex lg:flex-row-reverse lg:justify-end lg:items-baseline">
              <p className="lg:ml-2">{market.underlyingSymbol}</p>
              <p className="font-sans-semibold text-subheading">{market.underlyingName}</p>
            </span>
            <h1 className="hidden lg:block">{usdFormatter.format(market.underlyingPrice)}</h1>
          </div>
        </div>
        <h1 className="lg:hidden">{usdFormatter.format(market.underlyingPrice)}</h1>
      </div>

      {/* mutable asset metrics */}
      <div className="flex justify-between px-16 lg:px-0 mt-7 lg:mt-1">
        <div className="pr-6">
          <div className="caption-label">Supplied</div>
          <h2 className="py-1">{formatAbbrUSD(market.totalSupplyUSD)}</h2>
          <PercentChange yesterdayVal={yesterday.totalSupplyUSD} todayVal={market.totalSupplyUSD} />
        </div>
        <div className="pr-6">
          <div className="caption-label">Borrowed</div>
          <h2 className="py-1">{formatAbbrUSD(market.totalBorrowsUSD)}</h2>
          <PercentChange
            yesterdayVal={yesterday.totalBorrowsUSD}
            todayVal={market.totalBorrowsUSD}
          />
        </div>
        <div className="pr-6">
          <div className="caption-label">Utilization</div>
          <h2 className="py-1">
            {((market.totalBorrowsUSD / market.totalSupplyUSD) * 100).toFixed(2)}%
          </h2>
          <PercentChange
            yesterdayVal={yesterday.totalBorrowsUSD / yesterday.totalSupplyUSD}
            todayVal={market.totalBorrowsUSD / market.totalSupplyUSD}
          />
        </div>
        <div>
          <div className="caption-label">Liquidity</div>
          <h2 className="py-1">{formatAbbrUSD(+market.cash * market.underlyingPrice)}</h2>
          <PercentChange yesterdayVal={+yesterday.cash} todayVal={+market.cash} />
        </div>
      </div>
    </div>
  );
}
