import { ethers } from 'ethers';

const PROVIDER = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/', {
  name: 'Fantom Opera',
  chainId: 250,
});

export const getCompSpeeds = async (cToken: string) => {
  try {
    const unitrollerAddress = '0x260e596dabe3afc463e75b6cc05d8c46acacfb09';
    const comptrollerAbi = ['function compSpeeds(address cToken) view returns (uint compSpeed)'];
    const comptroller = new ethers.Contract(unitrollerAddress, comptrollerAbi, PROVIDER);
    const compSpeedsBN: ethers.BigNumber = await comptroller.compSpeeds(cToken);
    return +ethers.utils.formatEther(compSpeedsBN);
  } catch (e) {
    console.error(e);
  }

  return 0;
};

export const getScreamPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/scream');
    const {
      market_data: {
        current_price: { usd },
      },
    } = await response.json();

    return usd;
  } catch (e) {
    console.error(e);
  }

  return 0;
};

const getTokenTransfers = async (): Promise<any> => {
  try {
    // NOTE: addresses must be lower case!
    const screamAddress = '0xe0654c8e6fd4d733349ac7e09f6f23da256bf475';
    const fromAddress = '0x70f8892b9aed192b3e794f9398b62d50cf2fbbf8';
    const transferId = '0xa9059cbb';
    const res = await fetch(
      `https://api.ftmscan.com/api?module=account&action=txlist&address=${fromAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.FTMSCAN_API_KEY}`
    );
    const { result } = await res.json();

    return result.filter(
      (tx: any) =>
        tx.from === fromAddress &&
        tx.to === screamAddress &&
        (tx.input as string).startsWith(transferId)
    );
  } catch (e) {
    console.error(e);
  }

  return undefined;
};

interface Buyback {
  blockNumber: number;
  amount: number;
}

export const getBuybacks = async (): Promise<Buyback[]> => {
  try {
    const xScreamAddress = '0xe3d17c7e840ec140a7a51aca351a482231760824';
    const screamAbi = ['function transfer(address dst, uint rawAmount) external returns (bool)'];
    const screamInterface = new ethers.utils.Interface(screamAbi);
    const tokenTransfers = await getTokenTransfers();

    const buybackAmounts = tokenTransfers
      .map((tx: any) => ({
        data: screamInterface.decodeFunctionData('transfer', tx.input),
        blockNumber: tx.blockNumber,
      }))
      .filter(
        (decodedWithBlock: any) =>
          (decodedWithBlock.data[0] as string).toLowerCase() === xScreamAddress
      )
      .map((decodedWithBlock: any) => ({
        blockNumber: decodedWithBlock.blockNumber,
        amount: +ethers.utils.formatEther(decodedWithBlock.data.rawAmount),
      }));

    return buybackAmounts;
  } catch (e) {
    console.error(e);
  }

  return [];
};
