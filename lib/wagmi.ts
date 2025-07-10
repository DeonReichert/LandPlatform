import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Confidential Land Platform',
  projectId: 'c0d9ec9a4b8e53e6b6c0e4e3f3a9c2c1', // Get from https://cloud.walletconnect.com
  chains: [sepolia],
  ssr: false,
});
