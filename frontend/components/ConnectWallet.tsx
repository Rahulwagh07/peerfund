'use client';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatAddress } from '@/lib/utils';
import { Button } from './ui/button';

export default function ConnectWallet() {
  const [currentAccount, setCurrentAccount] = useState<string>('');

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        toast.error('Metamask not detected', {position: "top-center"});
        return;
      }

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('Connected to chain:', chainId);
      
      const sepoliaChainId = '0xaa36a7';
      const ganacheChainId = '0x539';

      if (chainId !== sepoliaChainId && chainId !== ganacheChainId) {
        alert('You are not connected to the Sepolia Testnet or Ganache local network!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Found account:', accounts[0]);
      setCurrentAccount(accounts[0]);
      toast.success('Wallet connected', {position: "top-center"});
    } catch (error) {
      console.log('Error connecting to MetaMask:', error);
    }
  };

  return (
    <div>
      <ToastContainer />
      {currentAccount === '' ? (
        <Button size={"lg"} onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Button size="lg" onClick={() => window.navigator.clipboard.writeText(currentAccount)}>
          {formatAddress(currentAccount)}
        </Button>
      )}
    </div>
  );
}
