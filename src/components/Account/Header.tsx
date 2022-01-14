import Image from 'next/image';
import { useState } from 'react';
import { Account, getHealth } from '../../utils/Account';
import ValueWithLabel from '../ValueWithLabel';
import HealthSimulator from './HealthSimulator';

export default function AccountHeader({ account }: { account: Account }) {
  const [showSimulator, setShowSimulator] = useState(false);

  return (
    <>
      <div className="flex flex-col lg:flex-row lg:justify-between">
        <div className="flex mb-4 pb-6 border-b border-border-primary lg:border-0">
          <div style={{ width: 33, height: 33, position: 'relative' }}>
            <Image src="/images/User.png" layout="fill" objectFit="contain" alt="account" />
          </div>
          <div className="pl-5">
            <h1>
              {`${account.id.slice(0, 6)}...${account.id.slice(-4)}`}
              <button className="pl-5" onClick={() => navigator.clipboard.writeText(account.id)}>
                <Image src="/images/Copy.png" width={13} height={15} alt="copy" />
              </button>
            </h1>
            <p className="pt-3">
              Health score{' '}
              <span className="font-sans-semibold">
                {getHealth(account.borrowLimitUSD, account.borrowBalanceUSD).toFixed(2)}
              </span>
            </p>

            <button
              className="border border-border-primary rounded-l-full rounded-r-full py-2 px-3 mt-3 text-body"
              onClick={() => setShowSimulator(true)}
            >
              Try Simulator →
            </button>
          </div>
        </div>
        <div>
          <div className="flex pt-4">
            <ValueWithLabel
              label="Times Liquidated"
              value={account.countLiquidated}
              className="pr-6"
            />
            <ValueWithLabel label="Liquidator Count" value={account.countLiquidator} />
          </div>
        </div>
      </div>
      {showSimulator && (
        <HealthSimulator account={account} onClose={() => setShowSimulator(false)} />
      )}
    </>
  );
}
