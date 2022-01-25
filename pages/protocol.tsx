import React, { useEffect, useState } from 'react';
import Layout from '../src/components/Layout';
import BuybackChart from '../src/components/Protocol/BuybackChart';
import ReservesBreakdown from '../src/components/Protocol/ReservesBreakdown';
import { useGlobalContext } from '../src/contexts/GlobalContext';
import { MARKETS_BY_BLOCK_QUERY } from '../src/queries';
import { Buyback, getBuybacks } from '../src/utils';
import { Market, RawMarket, transformMarketData } from '../src/utils/Market';
import { screamClient } from './_app';

export default function ProtocolOverview() {
  const { setShowLoading, showLoading } = useGlobalContext();
  const [buybacks, setBuybacks] = useState<Buyback[]>([]);
  const [lastBuybackMarkets, setLastBuybackMarkets] = useState<Market[]>([]);

  useEffect(() => {
    getBuybacks().then((res) => {
      setBuybacks(res);
    });
  }, []);

  useEffect(() => {
    if (buybacks.length) {
      screamClient
        .query<{ markets: RawMarket[] }>({
          query: MARKETS_BY_BLOCK_QUERY,
          variables: {
            blockNumber: +buybacks[buybacks.length - 1].blockNumber,
          },
        })
        .then((query) => setLastBuybackMarkets(transformMarketData(query.data.markets)));
    }
  }, [buybacks]);

  useEffect(() => {
    if (!buybacks.length || !lastBuybackMarkets.length) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
    }
  }, [showLoading, setShowLoading, buybacks.length, lastBuybackMarkets.length]);

  if (showLoading) {
    return null;
  }

  return (
    <Layout home="protocol">
      <h1 className="pb-6 mx-4 border-border-primary border-b mb-6 lg:hidden">Protocol Overview</h1>
      <div className="flex flex-col lg:flex-row">
        <div className="w-full">
          <div className="flex flex-col p-4 bg-darkGray shadow-3xl mb-6">
            <div style={{ height: 500 }}>
              <h3 className="pb-3 mb-3 border-b border-border-secondary">SCREAM Price</h3>
              <iframe
                loading="lazy"
                width="100%"
                height="90%"
                src="https://kek.tools/t/0xe0654c8e6fd4d733349ac7e09f6f23da256bf475/chart?pair=0x30872e4fc4edbfd7a352bfc2463eb4fae9c09086&currencyType=native&accent=off"
                scrolling="no"
              ></iframe>
            </div>
          </div>
          <div className="flex flex-col p-4 mb-6 bg-darkGray shadow-3xl">
            <h3 className="pb-3 mb-3 border-b border-border-secondary">SCREAM Buybacks</h3>
            {!!buybacks.length && <BuybackChart data={buybacks} />}
          </div>
        </div>

        <div className="lg:ml-5 lg:w-1/2">
          <div className="flex flex-col p-4 bg-darkGray shadow-3xl">
            <div className="flex justify-between pb-3 mb-3 border-b border-border-secondary">
              <h3>Protocol Reserves</h3>
            </div>
            {!!buybacks.length && lastBuybackMarkets && (
              <ReservesBreakdown lastBuybackMarkets={lastBuybackMarkets} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
