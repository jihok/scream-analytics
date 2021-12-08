import { useQuery } from '@apollo/client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LatestBlockQuery, LATEST_BLOCK_QUERY } from '../queries';
import { getScreamPrice } from '../utils';

interface GlobalContext {
  latestSyncedBlock: number;
  screamPrice: number;
}

const GlobalContext = createContext<GlobalContext>({ latestSyncedBlock: 0, screamPrice: 0 });

export default function GlobalProvider(props: { children: React.ReactNode }) {
  const { loading, error, data } = useQuery<LatestBlockQuery>(LATEST_BLOCK_QUERY);
  const [screamPrice, setScreamPrice] = useState(0);

  useEffect(() => {
    const fetchScreamPrice = async () => {
      setScreamPrice(await getScreamPrice());
    };
    fetchScreamPrice();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( - global</p>;

  return (
    <GlobalContext.Provider
      value={{ latestSyncedBlock: data?._meta.block.number ?? 0, screamPrice }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
