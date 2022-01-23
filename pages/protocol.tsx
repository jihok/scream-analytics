import React from 'react';
import Layout from '../src/components/Layout';
import ReservesBreakdown from '../src/components/Protocol/ReservesBreakdown';

export default function ProtocolOverview() {
  return (
    <Layout home="protocol">
      <h1 className="pb-6 border-border-primary border-b mb-6 lg:hidden">Protocol Overview</h1>
      <div className="flex flex-col justify-between lg:flex-row">
        <div
          className="flex flex-col p-4 bg-darkGray shadow-3xl w-full mb-5"
          style={{ height: 500 }}
        >
          <h3 className="pb-3 mb-3 border-b border-border-secondary">SCREAM Price</h3>
          <iframe
            loading="lazy"
            width="100%"
            height="100%"
            src="https://kek.tools/t/0xe0654c8e6fd4d733349ac7e09f6f23da256bf475/chart?pair=0x30872e4fc4edbfd7a352bfc2463eb4fae9c09086&currencyType=native&accent=off"
            scrolling="no"
          ></iframe>
        </div>

        <div className="flex flex-col lg:ml-5 lg:w-1/2">
          <div className="flex flex-col p-4 bg-darkGray shadow-3xl mb-6">
            <h3 className="pb-3 mb-3 border-b border-border-secondary">SCREAM Buybacks</h3>
          </div>

          <ReservesBreakdown />
        </div>
      </div>
    </Layout>
  );
}
