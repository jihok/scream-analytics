import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Account, getHealth } from '../../utils/Account';

interface SimToken {
  collateralFactor: number;
  totalUnderlyingSupplied: number;
  underlyingPrice: number;
  underlyingSymbol: string;
  storedBorrowBalance: number;
}

export default function HealthSimulator({
  account,
  onClose,
}: {
  account: Account;
  onClose: () => void;
}) {
  const [tokens, setTokens] = useState<SimToken[]>(
    account.tokens.map((token) => ({
      collateralFactor: token.market.collateralFactor,
      totalUnderlyingSupplied: token.totalUnderlyingSupplied,
      underlyingPrice: token.market.underlyingPrice,
      underlyingSymbol: token.market.underlyingSymbol,
      storedBorrowBalance: token.storedBorrowBalance,
    }))
  );

  const borrowLimitUSD = tokens.reduce(
    (prev, curr) =>
      prev +
      curr.collateralFactor *
        curr.totalUnderlyingSupplied * // TODO: check that this works
        curr.underlyingPrice,
    0
  );
  const borrowBalanceUSD = tokens.reduce(
    (prev, curr) => prev + curr.storedBorrowBalance * curr.underlyingPrice,
    0
  );
  const health = getHealth(borrowLimitUSD, borrowBalanceUSD);

  return (
    <div
      className="flex flex-col px-5 pt-8"
      style={{
        backgroundColor: '#0E0F10',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      <div className="flex justify-between pb-4">
        <h1 className="font-sans-light">Health score simulator</h1>
        <div style={{ width: 15, position: 'relative', cursor: 'pointer' }}>
          <Image
            src="/images/Cancel.png"
            alt="cancel"
            layout="fill"
            objectFit="contain"
            onClick={() => onClose()}
          />
        </div>
      </div>
      <p className="pb-6">
        Adjust the quantity and price of your assets to see how your health score will be impacted.
      </p>

      <div className="flex">
        <div className="pr-6 min-w-fit">
          <p>Health score</p>
          <h2 className="py-1">{health.toFixed(2)}</h2>
        </div>
        <div className="w-full pl-5">
          <div
            className={`flex justify-end rounded-full h-5 bg-gradient-to-r from-health-bad via-health-ok to-health-good ${
              health < 1.02 && 'rounded-l-full' // kinda hacky, but something of an edge case
            }`}
          >
            <div
              className="rounded-r-full h-5 bg-bar-6"
              style={{
                width: `${(2 - health) * 100}%`,
                marginRight: -2, // hack otherwise a tiny sliver of the parent gradient peeks through
              }}
            />
          </div>
          <div className="flex justify-between pt-3">
            <p>1.00</p>
            <p>2.00</p>
          </div>
        </div>
      </div>

      {tokens.map((token, i) => (
        <div key={token.underlyingSymbol}>
          {token.underlyingSymbol}
          <input
            type="number"
            onChange={({ target: { value } }) => {
              tokens.splice(i, 1, { ...tokens[i], totalUnderlyingSupplied: +value }); // TODO: check that this works
            }}
          />
          <input
            type="number"
            onChange={
              ({ target: { value } }) =>
                tokens.splice(i, 1, { ...tokens[i], underlyingPrice: +value }) // TODO: check that this works
            }
          />
        </div>
      ))}
    </div>
  );
}
