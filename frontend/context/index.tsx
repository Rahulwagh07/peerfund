'use client'

import { wagmiAdapter, projectId } from "../wagmi/index"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mainnet, arbitrum, avalanche, base, optimism, polygon, sepolia} from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';
import { WagmiProvider, type Config } from 'wagmi';
import { createExtendedAppKit, ganache } from "@/wagmi/appkit-extension";

const queryClient = new QueryClient();

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// const metadata = {
//   name: 'defi',
//   description: 'AppKit Example',
//   url: 'http://localhost:3000',
//   icons: ['https://assets.reown.com/reown-profile-pic.png']
// };

const modal = createExtendedAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, avalanche, base, optimism, polygon, sepolia, ganache],
  defaultNetwork: sepolia,
  // metadata: metadata,
  features: {
    analytics: true,
  }
});

interface ProvidersProps {
  children: ReactNode;
  initialState: any;  
}

function Providers({ children, initialState }: ProvidersProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default Providers;
