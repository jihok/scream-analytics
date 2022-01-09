import { useEffect, useState } from 'react';
import { Account, getHealth } from '../utils/Account';

interface SimToken {
  collateralFactor: number;
  totalUnderlyingSupplied: number;
  underlyingPrice: number;
  underlyingSymbol: string;
  storedBorrowBalance: number;
}

export default function HealthSimulator({ account }: { account: Account }) {
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
    <div>
      {/* TODO: gradient here */}
      <div>{health}</div>
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
