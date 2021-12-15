import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Layout from '../../src/components/Layout';
import { ACCOUNT_QUERY } from '../../src/queries';

export default function Account() {
  const { query } = useRouter();
  const id = query.id as string;
  const { loading, error, data } = useQuery(ACCOUNT_QUERY, {
    variables: { id: query.id },
  });

  if (loading || !id) return <p>Loading</p>;
  if (error) return <p>Error :(</p>;

  const account = data.accounts[0];

  return (
    <Layout className="p-5">
      <div className="flex flex-col lg:flex-row lg:justify-between">
        <div className="flex pb-7">
          <Image src="/img/tokens/dai.svg" width={33} height={33} alt="account" />
          <div className="pl-5">
            <h1>
              {`${id.slice(0, 6)}...${id.slice(-4)}`}
              <button className="pl-8" onClick={() => navigator.clipboard.writeText(id)}>
                🚔
              </button>
            </h1>
            <p className="text-subheading pt-3">
              Health score <span className="font-sans-semibold">{0.12}</span>
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

      <h3 className="pt-10 pb-4">Account overview</h3>
    </Layout>
  );
}
