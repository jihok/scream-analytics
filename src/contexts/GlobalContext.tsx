import { useQuery } from '@apollo/client';
import { createContext, useContext } from 'react';
import { LATEST_BLOCK_QUERY } from '../queries';

interface GlobalContext {
  latestSyncedBlock?: number;
}

interface QueryData {
  _meta: {
    block: {
      number: number;
    };
  };
}

const GlobalContext = createContext<GlobalContext>({});

const Provider = (props: { children: React.ReactNode }) => {
  const { loading, error, data } = useQuery<QueryData>(LATEST_BLOCK_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <GlobalContext.Provider
      value={{ latestSyncedBlock: data?._meta.block.number }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export default Provider;
