import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';
import { MarketPageProps } from '../../../pages/market/[id]';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { BLOCKS_IN_A_DAY } from '../../contexts/MarketContext';
import { getCompSpeeds } from '../../utils';
import { usdFormatter } from '../../utils/Market';
import PercentChange from '../PercentChange';
import ValueWithLabel from '../ValueWithLabel';

export default function MarketState({ yesterday, market }: MarketPageProps) {
  const { screamPrice } = useGlobalContext();
  const [compSpeeds, setCompSpeeds] = useState(0);

  useEffect(() => {
    const getDistributionData = async () => {
      setCompSpeeds(await getCompSpeeds(market.id));
    };
    getDistributionData();
  }, [market]);

  const supplyDistribution = new BigNumber(compSpeeds)
    .times(screamPrice)
    .times(BLOCKS_IN_A_DAY)
    .div(market.totalSupplyUSD)
    .plus(1)
    .pow(365)
    .minus(1)
    .times(100)
    .toNumber();
  const borrowDistribution = new BigNumber(compSpeeds)
    .times(screamPrice)
    .times(BLOCKS_IN_A_DAY)
    .div(market.totalBorrowsUSD)
    .plus(1)
    .pow(365)
    .minus(1)
    .times(100)
    .toNumber();

  return (
    <div style={{ minWidth: 'fit-content' }}>
      <div className="pb-8">
        <h3 className="pb-3">Current State</h3>
        <table className="w-full border-t border-border-primary mb-4 text-left">
          <thead className="text-body font-sans-semibold">
            <tr className="border-border-secondary border-b">
              <th />
              <th>APY</th>
              <th>Distribution APY</th>
              <th>Net APY</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-body font-sans-semibold">Supply</td>
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
            <tr>
              <td className="text-body font-sans-semibold">Borrow</td>
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
          </tbody>
        </table>

        <div className="flex whitespace-nowrap mb-3">
          <p>Estimated daily interest</p>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <p className="font-sans-semibold">
            {/*
              this is just an approximation since the subgraph's `borrowRate` is the compounded APY.
              to truly get the rate for a given day, we should either take the APY^(1/365)
              or fetch the per block rate from the scToken contract
            */}
            {usdFormatter.format((market.borrowAPY / 100 / 365) * market.totalBorrowsUSD)}
          </p>
        </div>
        <div className="flex whitespace-nowrap mb-3">
          <span className="text-body">Total interest accumulated</span>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <span className="text-body font-sans-semibold">
            {usdFormatter.format(market.totalInterestAccumulated * market.underlyingPrice)}
          </span>
        </div>
        <div className="flex whitespace-nowrap mb-3">
          <span className="text-body">Exchange rate </span>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <span className="text-body font-sans-semibold">
            1 {market.underlyingSymbol} = {market.exchangeRate.toFixed(6)} {market.symbol}
          </span>
        </div>
        <div className="flex whitespace-nowrap">
          <span className="text-body">{market.symbol} Minted</span>
          <div className="border-b border-border-secondary w-full self-center mx-2" />
          <span className="text-body font-sans-semibold">
            {(+market.totalSupply).toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <h3 className="pb-3 border-b border-border-primary">Market Parameters</h3>
        <div className="flex mt-5">
          <ValueWithLabel
            label="Reserve Factor"
            type="percent"
            value={market.reserveFactor * 100}
            className="pr-6"
          />
          <ValueWithLabel
            label="Collateral Factor"
            type="percent"
            value={market.collateralFactor * 100}
            className="pr-6"
          />
          <ValueWithLabel
            label={`${market.underlyingSymbol} borrow cap`}
            type="percent"
            value="No Limit" // hardcoded for now
          />
        </div>
      </div>
    </div>
  );
}
