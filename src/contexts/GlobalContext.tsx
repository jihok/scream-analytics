import { useQuery } from '@apollo/client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Loading from '../components/Loading';
import { LatestBlockQuery, LATEST_BLOCK_QUERY } from '../queries';
import { getScreamPrice } from '../utils';

interface GlobalContext {
  latestSyncedBlock: number;
  screamPrice: number;
  showLoading: boolean;
  setShowLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<GlobalContext>({
  latestSyncedBlock: 0,
  screamPrice: 0,
  showLoading: true,
  setShowLoading: () => {},
});

export default function GlobalProvider(props: { children: React.ReactNode }) {
  const { loading, error, data } = useQuery<LatestBlockQuery>(LATEST_BLOCK_QUERY);
  const [screamPrice, setScreamPrice] = useState(0);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const fetchScreamPrice = async () => {
      setScreamPrice(await getScreamPrice());
    };
    fetchScreamPrice();
  }, []);

  useEffect(() => {
    setShowLoading(loading);
  }, [loading]);

  if (loading) return <Loading />;
  if (error) return <p>Error :( - global</p>;

  return (
    <GlobalContext.Provider
      value={{
        latestSyncedBlock: data?._meta.block.number ?? 0,
        screamPrice,
        showLoading,
        setShowLoading,
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
