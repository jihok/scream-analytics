import { useEffect, useState } from 'react';
import { BLOCKS_IN_A_DAY } from '../../../pages';
import { screamClient } from '../../../pages/_app';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { ASSET_BY_BLOCK_QUERY } from '../../queries';
import { RawMarket, transformData } from '../../utils/Market';

interface Props {
  asset: any;
}

export function Details({ asset }: Props) {
  const { latestSyncedBlock } = useGlobalContext();
  console.log('passed down info: ', latestSyncedBlock, asset);
  const blocksToQuery = [...Array(7)].map((_, i) => latestSyncedBlock - BLOCKS_IN_A_DAY * i);
  console.log(blocksToQuery);
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const a = await Promise.all(
        blocksToQuery.map((blockNumber) =>
          screamClient.query<{ markets: RawMarket[] }>({
            query: ASSET_BY_BLOCK_QUERY,
            variables: {
              blockNumber,
              id: asset.id,
            },
          })
        )
      );
      setData(a.map((b) => transformData(b.data.markets)[0]));
      console.log(a.map((b) => transformData(b.data.markets)[0]));
    })();
  }, [blocksToQuery, asset]);

  return <div />;
}
