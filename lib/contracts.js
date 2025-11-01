import { ethers } from 'ethers'
import { sdk } from '@farcaster/miniapp-sdk'
function wrapProvider(rawProvider) {
  if (rawProvider.request) return rawProvider;
  rawProvider.request = async (request) => {
    const { method, params = [] } = request;
    return rawProvider.send(method, params);
  };
  return rawProvider;
}
export const getRawProvider = async () => {
  if (typeof window !== 'undefined') {
    let eip1193 = window.ethereum;
    if (await sdk.isInMiniApp()) {
      eip1193 = await sdk.wallet.getEthereumProvider();
    }
    if (eip1193) {
      return wrapProvider(eip1193);
    }
  }
  const jsonRpc = new ethers.JsonRpcProvider('https://mainnet.base.org');
  return wrapProvider(jsonRpc);
}
export const getProvider = async () => {
  const raw = await getRawProvider();
  return new ethers.BrowserProvider(raw);
}
export const switchToBaseMainnet = async () => {
  const rawProvider = await getRawProvider();
  try {
    await rawProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await rawProvider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x2105',
          chainName: 'Base',
          nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org']
        }]
      });
      await rawProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x2105' }]
      });
    } else {
      console.error('Switch chain error:', switchError);
      throw switchError;
    }
  }
}