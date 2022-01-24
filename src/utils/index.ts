import { ethers } from 'ethers';

const UNITROLLER_ADDRESS = '0x260e596dabe3afc463e75b6cc05d8c46acacfb09';
const COMPTROLLER_ABI = ['function compSpeeds(address cToken) view returns (uint compSpeed)'];
const PROVIDER = new ethers.providers.JsonRpcProvider('https://rpc.ftm.tools/', {
  name: 'Fantom Opera',
  chainId: 250,
});

export const getCompSpeeds = async (cToken: string) => {
  try {
    // console.log(
    // 'buybacks',
    //   await PROVIDER.getTransaction(
    //     '0x204db01d61f1db742441c91b981b9e71d117ab3f7f62ce2d63b7b3d820e7fd42'
    //   )
    // );
    const comptroller = new ethers.Contract(UNITROLLER_ADDRESS, COMPTROLLER_ABI, PROVIDER);
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

const getTransactionHashes = async (): Promise<any> => {
  try {
    // NOTE: addresses must be lower case!
    const xScreamAddress = '0xe0654c8e6fd4d733349ac7e09f6f23da256bf475';
    const fromAddress = '0x70f8892b9aed192b3e794f9398b62d50cf2fbbf8';
    const res = await fetch(
      `https://api.ftmscan.com/api?module=account&action=txlist&address=${fromAddress}&startblock=0&endblock=99999999&sort=asc&apikey=${process.env.FTMSCAN_API_KEY}`
    );
    const { result } = await res.json();

    return result.filter((tx: any) => tx.from === fromAddress && tx.to === xScreamAddress);
  } catch (e) {
    console.error(e);
  }

  return 0;
};

export const getTransactions = async (): Promise<any> => {
  try {
    return await getTransactionHashes();
  } catch (e) {
    console.error(e);
  }

  return 0;
};
