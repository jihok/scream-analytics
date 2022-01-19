import { useState } from 'react';
import Image from 'next/image';
import { Account, getHealth } from '../../utils/Account';
import { usdFormatter } from '../../utils/Market';

interface SimToken {
  collateralFactor: number;
  supplyQuantity: number;
  underlyingPrice: number;
  underlyingSymbol: string;
  underlyingName: string;
  storedBorrowBalance: number;
}

export default function HealthSimulator({ account }: { account: Account }) {
  const [showModal, setShowModal] = useState(false);
  const [tokens, setTokens] = useState<SimToken[]>(
    account.tokens.map((token) => ({
      collateralFactor: token.market.collateralFactor,
      supplyQuantity: token.cTokenBalance * token.market.exchangeRate,
      underlyingPrice: token.market.underlyingPrice,
      underlyingSymbol: token.market.underlyingSymbol,
      underlyingName: token.market.underlyingName,
      storedBorrowBalance: token.storedBorrowBalance,
    }))
  );

  const borrowLimitUSD = tokens.reduce(
    (prev, curr) => prev + curr.collateralFactor * curr.supplyQuantity * curr.underlyingPrice,
    0
  );
  const borrowBalanceUSD = tokens.reduce(
    (prev, curr) => prev + curr.storedBorrowBalance * curr.underlyingPrice,
    0
  );
  const health = getHealth(borrowLimitUSD, borrowBalanceUSD);

  return (
    <>
      <button
        className="border border-border-primary rounded-l-full rounded-r-full py-2 px-3 mt-3 text-body"
        onClick={() => setShowModal(true)}
      >
        Try Simulator →
      </button>
      {showModal && (
        <div className="flex bg-modalOverlay justify-center fixed top-0 left-0 right-0 bottom-0 z-10 md:pt-10 md:pb-10">
          <div className="flex flex-col px-5 pt-8 pb-12 overflow-scroll simulator">
            <div className="flex justify-between pb-4">
              <h1 className="font-sans-light">Health score simulator</h1>
              <div style={{ width: 15, position: 'relative', cursor: 'pointer' }}>
                <Image
                  src="/images/Cancel.png"
                  alt="cancel"
                  layout="fill"
                  objectFit="contain"
                  onClick={() => setShowModal(false)}
                />
              </div>
            </div>
            <p className="pb-11">
              Adjust the quantity and price of your assets to see how your health score will be
              impacted.
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

            <div className="flex justify-between pt-10 pb-3 border-b border-border-primary">
              <h3>Supply</h3>
              <p className="text-title">
                {usdFormatter.format(
                  tokens.reduce(
                    (prev, curr) => prev + curr.supplyQuantity * curr.underlyingPrice,
                    0
                  )
                )}
              </p>
            </div>
            {tokens
              .filter((_, i) => !!account.tokens[i].cTokenBalance)
              .map((token) => {
                const i = tokens.findIndex((t) => token.underlyingSymbol === t.underlyingSymbol);
                return (
                  <div
                    className="py-4 border-b border-border-secondary"
                    key={token.underlyingSymbol}
                  >
                    <div className="flex items-end pb-4">
                      <span
                        style={{ width: 18, height: 18, marginRight: 12, position: 'relative' }}
                      >
                        <Image
                          src={`/images/tokens/${token.underlyingSymbol.toLowerCase()}.png`}
                          layout="fill"
                          objectFit="contain"
                          alt={token.underlyingSymbol}
                        />
                      </span>
                      <h3 className="pr-2">{token.underlyingName}</h3>
                      <p className="p-0">{token.underlyingSymbol}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex flex-col items-end">
                        <label className="pb-2">
                          <p>Price (USD)</p>
                        </label>
                        <input
                          type="number"
                          value={tokens[i].underlyingPrice}
                          onChange={({ target: { value } }) => {
                            const temp = [...tokens];
                            temp.splice(i, 1, { ...tokens[i], underlyingPrice: +value });
                            setTokens(temp);
                          }}
                        />
                      </span>
                      <span className="flex flex-col items-end">
                        <label className="pb-2">
                          <p>Quantity</p>
                        </label>
                        <input
                          type="number"
                          value={tokens[i].supplyQuantity}
                          onChange={({ target: { value } }) => {
                            const temp = [...tokens];
                            temp.splice(i, 1, { ...tokens[i], supplyQuantity: +value });
                            setTokens(temp);
                          }}
                        />
                      </span>
                      <span>
                        <p className="pb-5">Total USD</p>
                        <h2>{usdFormatter.format(token.supplyQuantity * token.underlyingPrice)}</h2>
                      </span>
                    </div>
                  </div>
                );
              })}

            <div className="flex justify-between pt-10 pb-3 border-b border-border-primary">
              <h3>Borrow</h3>
              <p className="text-title">
                {usdFormatter.format(
                  tokens.reduce(
                    (prev, curr) => prev + curr.storedBorrowBalance * curr.underlyingPrice,
                    0
                  )
                )}
              </p>
            </div>
            {tokens
              .filter((_, i) => !!account.tokens[i].storedBorrowBalance)
              .map((token) => {
                const i = tokens.findIndex((t) => token.underlyingSymbol === t.underlyingSymbol);
                return (
                  <div
                    className="py-4 border-b border-border-secondary"
                    key={token.underlyingSymbol}
                  >
                    <div className="flex items-end pb-4">
                      <span
                        style={{ width: 18, height: 18, marginRight: 12, position: 'relative' }}
                      >
                        <Image
                          src={`/images/tokens/${token.underlyingSymbol.toLowerCase()}.png`}
                          layout="fill"
                          objectFit="contain"
                          alt={token.underlyingSymbol}
                        />
                      </span>
                      <h3 className="pr-2">{token.underlyingName}</h3>
                      <p className="p-0">{token.underlyingSymbol}</p>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex flex-col items-end">
                        <label className="pb-2">
                          <p>Price (USD)</p>
                        </label>
                        <input
                          type="number"
                          value={tokens[i].underlyingPrice}
                          onChange={({ target: { value } }) => {
                            const temp = [...tokens];
                            temp.splice(i, 1, { ...tokens[i], underlyingPrice: +value });
                            setTokens(temp);
                          }}
                        />
                      </span>
                      <span className="flex flex-col items-end">
                        <label className="pb-2">
                          <p>Quantity</p>
                        </label>
                        <input
                          type="number"
                          value={tokens[i].storedBorrowBalance}
                          onChange={({ target: { value } }) => {
                            const temp = [...tokens];
                            temp.splice(i, 1, { ...tokens[i], storedBorrowBalance: +value });
                            setTokens(temp);
                          }}
                        />
                      </span>
                      <span>
                        <p className="pb-5">Total USD</p>
                        <h2>
                          {usdFormatter.format(token.storedBorrowBalance * token.underlyingPrice)}
                        </h2>
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
}
