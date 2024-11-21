import { cookieStorage, createStorage} from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { sepolia } from '@reown/appkit/networks';
import { ganache } from './appkit-extension';

export const projectId =  process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [sepolia, ganache];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
});

export const config = wagmiAdapter.wagmiConfig;