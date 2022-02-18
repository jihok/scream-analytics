import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Layout from '../../src/components/Layout';
import { ACCOUNT_QUERY } from '../../src/queries';
import { RawAccount, transformAccountData } from '../../src/utils/Account';
import AccountHeader from '../../src/components/Account/Header';
import { BORROW_COLOR, SUPPLY_COLOR } from '../../src/components/Market/UtilizationChart';
import { formatAbbrUSD, usdFormatter } from '../../src/utils/Market';
import { useGlobalContext } from '../../src/contexts/GlobalContext';

const REPAID_COLOR = '#89DFDB'; // also equal to bg-bar-0

export default function Account() {
  const { showLoading, setShowLoading } = useGlobalContext();
  const {
    query: { id },
  } = useRouter();
  const { loading, error, data } = useQuery<{ accounts: RawAccount[] }>(ACCOUNT_QUERY, {
    variables: { id },
  });
  const [overviewType, setOverviewType] = useState<'supplied' | 'borrowed'>('supplied');

  useEffect(() => {
    if (loading && !data) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [data, loading, setShowLoading]);
  if (error) return <p>Error :(</p>;

  if (showLoading || !data) {
    return null;
  }

  if (!data.accounts.length) {
    return (
      <Layout className="p-5 lg:px-80">
        <div className="flex flex-col items-center justify-center">
          <div className="flex pb-8">
            <Image src="/images/User.png" width={33} height={33} alt="account" />
            <h1 className="pl-5">No user address found.</h1>
          </div>
          <p>Please try your search again.</p>
        </div>
      </Layout>
    );
  }

  const account = transformAccountData(data.accounts[0]);

  return (
    <Layout className={`p-5 lg:px-80`}>
      <AccountHeader account={account} />

      <h3 className="pt-10 pb-4">Account overview</h3>
      <div className="flex text-center mb-4">
        <p
          className={`${
            overviewType === 'supplied'
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pb-3 cursor-pointer`}
          onClick={() => setOverviewType('supplied')}
        >
          Supply
        </p>
        <p
          className={`${
            overviewType === 'borrowed'
              ? 'border-b-2 border-border-active font-sans-semibold'
              : 'border-b border-border-primary'
          }  w-half pb-3 cursor-pointer`}
          onClick={() => setOverviewType('borrowed')}
        >
          Borrow
        </p>
      </div>
      <div className="flex flex-col mb-8">
        {account.tokens.map((token) => {
          if (!token.cTokenBalance && overviewType === 'supplied') return;
          if (overviewType === 'borrowed' && !token.storedBorrowBalance) return;

          const valueUSD =
            overviewType === 'supplied'
              ? token.cTokenBalance * token.market.exchangeRate * token.market.underlyingPrice
              : token.storedBorrowBalance * token.market.underlyingPrice;

          const repaid =
            (token.totalUnderlyingRepaid /
              (token.storedBorrowBalance + token.totalUnderlyingRepaid)) *
            100;
          const barWidthPercent =
            overviewType === 'supplied'
              ? (valueUSD / account.totalSuppliedUSD) * 100
              : ((token.totalUnderlyingBorrowed * token.market.underlyingPrice) /
                  account.totalBorrowedUSD) *
                100;

          return (
            <div className="flex flex-row items-center" key={token.symbol}>
              <div
                className={`label-body pr-6 ${overviewType === 'borrowed' && 'pb-8'}`}
                style={{ minWidth: 100, maxWidth: 100 }}
              >
                {token.market.underlyingSymbol}
                <div className="font-sans-semibold lg:pt-1">{token.market.underlyingName}</div>
              </div>
              <div className="border-border-primary border-l py-4 w-full">
                <div className="flex">
                  <div style={{ width: `${barWidthPercent}%` }}>
                    <div
                      style={{
                        backgroundColor: overviewType === 'supplied' ? SUPPLY_COLOR : BORROW_COLOR,
                        borderRadius: '0px 3px 3px 0px',
                        height: 24,
                      }}
                    >
                      {overviewType === 'borrowed' && (
                        <div
                          style={{
                            width: `${repaid}%`,
                            backgroundColor: REPAID_COLOR,
                            height: 24,
                          }}
                        />
                      )}
                    </div>
                    {overviewType === 'borrowed' && (
                      <div className="flex">
                        <div style={{ width: `${repaid}%` }} />
                        <div className="pl-1">
                          <p className="text-caption font-sans-semibold pt-2">Repaid</p>
                          <p className="text-label">
                            {token.totalUnderlyingRepaid * token.market.underlyingPrice > 10_000
                              ? formatAbbrUSD(
                                  token.totalUnderlyingRepaid * token.market.underlyingPrice
                                )
                              : usdFormatter(
                                  token.totalUnderlyingRepaid * token.market.underlyingPrice
                                )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      backgroundColor: '#31333799',
                      borderRadius: '0px 3px 3px 0px',
                      height: 24,
                      width: `${100 - barWidthPercent}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`flex flex-col items-end pl-3 ${overviewType === 'borrowed' && 'pb-11'}`}
                style={{ minWidth: 80, width: 'fit-content' }}
              >
                {overviewType === 'borrowed' && (
                  <p className="text-caption font-sans-semibold pt-2 text-right">Remaining</p>
                )}
                <p className="label-body">
                  {valueUSD > 10_000 ? formatAbbrUSD(valueUSD) : `$${valueUSD.toFixed(2)}`}
                </p>
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
