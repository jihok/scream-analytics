import React from 'react';
import { Details } from '../../src/components/Table/Details';
import { Market } from '../../src/utils/Market';

interface Props {
  asset: Market;
}

export default function MarketPage({ asset }: Props) {
  return <Details asset={asset} />;
}
