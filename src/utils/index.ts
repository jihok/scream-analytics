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

export const getScreamPrice = async () => {
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
