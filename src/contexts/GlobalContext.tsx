import { useQuery } from '@apollo/client';
import { createContext, useContext } from 'react';
import { LatestBlockQuery, LATEST_BLOCK_QUERY } from '../queries';

interface GlobalContext {
  latestSyncedBlock: number;
}

const GlobalContext = createContext<GlobalContext>({ latestSyncedBlock: 0 });

const Provider = (props: { children: React.ReactNode }) => {
  const { loading, error, data } = useQuery<LatestBlockQuery>(LATEST_BLOCK_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <GlobalContext.Provider value={{ latestSyncedBlock: data?._meta.block.number ?? 0 }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export default Provider;
