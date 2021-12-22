import React, { useEffect, useState } from 'react';
import { MarketPageProps } from '../../../pages/market/[id]';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { BLOCKS_IN_A_DAY } from '../../contexts/MarketContext';
import { getCompSpeeds } from '../../utils';
import { usdFormatter } from '../../utils/Market';
import PercentChange from '../PercentChange';

export default function MarketState({ yesterday, market }: MarketPageProps) {
  const { screamPrice } = useGlobalContext();
  const [compSpeeds, setCompSpeeds] = useState(0);

  useEffect(() => {
    const getDistributionData = async () => {
      setCompSpeeds(await getCompSpeeds(market.id));
    };
    getDistributionData();
  }, [market]);

  const supplyDistribution =
    ((BLOCKS_IN_A_DAY * 365) / market.totalSupplyUSD) * compSpeeds * screamPrice * 100;
  const borrowDistribution =
    ((BLOCKS_IN_A_DAY * 365) / market.totalBorrowsUSD) * compSpeeds * screamPrice * 100;

  return (
    <div style={{ minWidth: 'fit-content' }}>
      <div className="pb-8">
        <h3 className="pb-3">Current State</h3>
        <table className="w-full border-t border-border-primary mb-4 text-left">
          <thead className="caption-label">
            <tr className="border-border-secondary border-b">
              <th />
              <th>APY</th>
              <th>Distribution APY</th>
              <th>Net APY</th>
            </tr>
          </thead>
          <tr className="border-border-secondary border-b">
            <td className="caption-label">Supply</td>
            <td>
              <h2 className="pb-1">{market.supplyAPY.toFixed(2)}%</h2>
              <PercentChange yesterdayVal={yesterday.supplyAPY} todayVal={market.supplyAPY} />
            </td>
            <td>
              <h2>{supplyDistribution.toFixed(2)}%</h2>
            </td>
            <td>
              <h2>{(market.supplyAPY + supplyDistribution).toFixed(2)}%</h2>
            </td>
          </tr>
          <tr className="border-border-primary border-b">
            <td className="caption-label">Borrow</td>
            <td>
              <h2 className="pb-1">{market.borrowAPY.toFixed(2)}%</h2>
              <PercentChange yesterdayVal={yesterday.borrowAPY} todayVal={market.borrowAPY} />
            </td>
            <td>
              <h2>{borrowDistribution.toFixed(2)}%</h2>
            </td>
            <td>
              <h2>{(market.borrowAPY - borrowDistribution).toFixed(2)}%</h2>
            </td>
          </tr>
        </table>

        <div className="flex whitespace-nowrap mb-3">
          <p>Interest paid per day</p>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <p className="font-sans-semibold">
            {usdFormatter.format((market.borrowAPY / 100 / 365) * market.totalBorrowsUSD)}
          </p>
        </div>
        <div className="flex whitespace-nowrap mb-3">
          <p>Total interest accumulated</p>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <p className="font-sans-semibold">
            {usdFormatter.format(market.totalInterestAccumulated * market.underlyingPrice)}
          </p>
        </div>
        <div className="flex whitespace-nowrap mb-3">
          <p>Exchange rate </p>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <p className="font-sans-semibold">
            1 {market.underlyingSymbol} = {market.exchangeRate.toFixed(6)} {market.symbol}
          </p>
        </div>
        <div className="flex whitespace-nowrap">
          <p>{market.symbol} Minted</p>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <p className="font-sans-semibold">{(+market.totalSupply).toLocaleString()}</p>
        </div>
      </div>

      <div>
        <h3 className="pb-3 border-b border-border-primary">Market Parameters</h3>
        <div className="flex mt-5">
          <div className="pr-6">
            <div className="caption-label">Reserve Factor</div>
            <h2 className="py-1">{market.reserveFactor * 100}%</h2>
          </div>
          <div className="pr-6">
            <div className="caption-label">Collateral Factor</div>
            <h2 className="py-1">{market.collateralFactor * 100}%</h2>
          </div>
          <div className="pr-6">
            <div className="caption-label">{market.underlyingSymbol} borrow cap</div>
            <h2 className="py-1">No Limit</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
