import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Layout from '../../src/components/Layout';
import { ACCOUNT_QUERY } from '../../src/queries';
import { RawAccount, transformAccountData } from '../../src/utils/Account';
import AccountHeader from '../../src/components/Account/Header';

export default function Account() {
  const {
    query: { id },
  } = useRouter();
  const { loading, error, data } = useQuery<{ accounts: RawAccount[] }>(ACCOUNT_QUERY, {
    variables: { id },
  });
  const [overviewType, setOverviewType] = useState<'supplied' | 'borrowed'>('supplied');

  if (loading || !data) return <p>Loading</p>;
  if (error) return <p>Error :(</p>;

  const account = transformAccountData(data.accounts[0]);

  console.log(account);
  return (
    <Layout className="p-5">
      <AccountHeader account={account} />

      <h3 className="pt-10 pb-4">Account overview</h3>
      <div className="flex text-center mb-4" style={{ cursor: 'pointer' }}>
        <p
          className={`${
            overviewType === 'supplied'
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pb-3`}
          onClick={() => setOverviewType('supplied')}
        >
          Supply
        </p>
        <p
          className={`${
            overviewType === 'borrowed'
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pb-3`}
          onClick={() => setOverviewType('borrowed')}
        >
          Borrow
        </p>
      </div>
      <p>Current state {overviewType}</p>

      <p className="mb-4">Lifetime {overviewType} interest accrued</p>
      {account.tokens.map((token) => (
        <div className="flex whitespace-nowrap mb-3" key={token.symbol}>
          <p>{token.market.underlyingSymbol}</p>
          <div className="border-b border-border-secondary w-full mb-1 mx-2" />
          <p className="font-sans-semibold">
            $
            {(overviewType === 'supplied'
              ? token.cTokenBalance * token.market.exchangeRate -
                token.totalUnderlyingSupplied +
                token.totalUnderlyingRedeemed
              : (token.storedBorrowBalance * token.market.borrowIndex) / token.accountBorrowIndex -
                token.totalUnderlyingBorrowed +
                token.totalUnderlyingRepaid
            ).toFixed(2)}
          </p>
        </div>
      ))}
    </Layout>
  );
}
