import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Layout from '../../src/components/Layout';
import { ACCOUNT_QUERY } from '../../src/queries';
import { RawAccount, transformAccountData } from '../../src/utils/Account';
import AccountHeader from '../../src/components/Account/Header';
import { BORROW_COLOR, SUPPLY_COLOR } from '../../src/components/UtilizationChart';

const REPAID_COLOR = '#89DFDB'; // also equal to bg-bar-0

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
    <Layout className="p-5 lg:px-80">
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
      <p className="mb-5">Current state {overviewType}</p>
      <div className="flex flex-col mb-8">
        {account.tokens.map((token) => {
          if (!token.cTokenBalance && overviewType === 'supplied') return;
          if (overviewType === 'borrowed' && !token.storedBorrowBalance) return;

          const valueUSD =
            overviewType === 'supplied'
              ? token.cTokenBalance * token.market.exchangeRate * token.market.underlyingPrice
              : token.storedBorrowBalance * token.market.underlyingPrice;

          const repaid =
            ((token.totalUnderlyingRepaid * token.market.underlyingPrice) /
              account.totalBorrowedUSD) *
            100;
          const barWidthPercent =
            overviewType === 'supplied'
              ? (valueUSD / account.totalSuppliedUSD) * 100
              : ((token.totalUnderlyingBorrowed * token.market.underlyingPrice) /
                  account.totalBorrowedUSD) *
                  100 -
                repaid;

          return (
            <div className="flex flex-row items-center" key={token.symbol}>
              <div
                className={`pr-6 ${overviewType === 'borrowed' && 'pb-8'}`}
                style={{ minWidth: 100, maxWidth: 100 }}
              >
                <p className="font-sans-semibold">{token.market.underlyingName}</p>
                <p>{token.market.underlyingSymbol}</p>
              </div>
              <div className="border-border-primary border-l py-4 w-full">
                <div className="flex">
                  {overviewType === 'borrowed' && (
                    <div
                      style={{
                        width: `${repaid}%`,
                        backgroundColor: REPAID_COLOR,
                        height: 24,
                      }}
                    />
                  )}
                  <div style={{ width: `${barWidthPercent}%` }}>
                    <div
                      style={{
                        backgroundColor: overviewType === 'supplied' ? SUPPLY_COLOR : BORROW_COLOR,
                        borderRadius: '0px 3px 3px 0px',
                        height: 24,
                      }}
                    />
                    {overviewType === 'borrowed' && (
                      <>
                        <p className="text-caption pt-2">Repaid</p>
                        <p className="font-sans-semibold">
                          ${(token.totalUnderlyingRepaid * token.market.underlyingPrice).toFixed(2)}
                        </p>
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      backgroundColor: '#31333799',
                      borderRadius: '0px 3px 3px 0px',
                      height: 24,
                      width: `${100 - barWidthPercent - repaid}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`flex flex-col items-end pl-3 ${overviewType === 'borrowed' && 'pb-11'}`}
                style={{ minWidth: 80, width: 'fit-content' }}
              >
                {overviewType === 'borrowed' && (
                  <p className="text-caption pt-2 text-right">Remaining</p>
                )}
                <p className="font-sans-semibold">${valueUSD.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mb-4">Lifetime {overviewType} interest accrued</p>
      {account.tokens.map((token) => {
        const interest =
          overviewType === 'supplied'
            ? (token.cTokenBalance * token.market.exchangeRate -
                token.totalUnderlyingSupplied +
                token.totalUnderlyingRedeemed) *
              token.market.underlyingPrice
            : (token.storedBorrowBalance * token.market.borrowIndex) / token.accountBorrowIndex -
              token.totalUnderlyingBorrowed +
              token.totalUnderlyingRepaid;
        if (!interest) return;

        return (
          <div className="flex whitespace-nowrap mb-3" key={token.symbol}>
            <p>{token.market.underlyingSymbol}</p>
            <div className="border-b border-border-secondary w-full self-center mx-2" />
            <p className="font-sans-semibold">${interest.toFixed(2)}</p>
          </div>
        );
      })}
    </Layout>
  );
}
