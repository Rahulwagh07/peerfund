"use client";

import React, { createContext, useContext, useState } from 'react';
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from "@metamask/providers";

interface WalletContextProps {
  currentAccount: string;
  web3: Web3 | undefined;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [web3, setWeb3] = useState<Web3 | undefined>(undefined);

  const connectWallet = async () => {
    const provider = await detectEthereumProvider() as MetaMaskInpageProvider;

    if (provider) {
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
        const web3Instance = new Web3(provider as any);

        // Check the network chain ID
        const chainId = await web3Instance.eth.getChainId();
        console.log('Connected to chain:', chainId);

        const ganacheChainId = 1337;  

        if (chainId !==  BigInt(ganacheChainId)) {
          alert('You are not connected to the Ganache local network!');
          return;
        }

        setWeb3(web3Instance);
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        alert('Failed to connect to MetaMask. Please try again.');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setCurrentAccount('');
    setWeb3(undefined);
  };

  return (
    <WalletContext.Provider value={{ currentAccount, web3, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};