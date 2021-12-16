import Image from 'next/image';
import { Account, getHealth } from '../../utils/Account';

export default function AccountHeader({ account }: { account: Account }) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between">
      <div className="flex pb-7">
        <Image src="/img/tokens/dai.svg" width={33} height={33} alt="account" />
        <div className="pl-5">
          <h1>
            {`${account.id.slice(0, 6)}...${account.id.slice(-4)}`}
            <button className="pl-8" onClick={() => navigator.clipboard.writeText(account.id)}>
              🚔
            </button>
          </h1>
          <p className="text-subheading pt-3">
            Health score{' '}
            <span className="font-sans-semibold">
              {getHealth(account.borrowLimit, account.borrowBalance)}
            </span>
          </p>
        </div>
      </div>
      <div className="lg:flex lg:flex-col-reverse">
        <h3 className="pb-3 border-b border-border-primary lg:invisible">Account stats</h3>
        <div className="flex pt-4">
          <div className="pr-6" style={{ maxWidth: 100 }}>
            <div className="caption-label">Times liquidated</div>
            <h2 className="py-1">{account.countLiquidated}</h2>
          </div>
          <div className="pr-6" style={{ maxWidth: 100 }}>
            <div className="caption-label">Liquidation count (others)</div>
            <h2 className="py-1">{account.countLiquidator}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
