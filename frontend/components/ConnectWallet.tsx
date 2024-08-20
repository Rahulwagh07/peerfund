'use client';
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ConnectWallet() {
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [correctNetwork, setCorrectNetwork] = useState<boolean>(false);

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;

      if (!ethereum) {
        toast.error('Metamask not detected');
        return;
      }

      const chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log('Connected to chain:' + chainId);

      const sepoliaChainId = '0xaa36a7';

      if (chainId !== sepoliaChainId) {
        alert('You are not connected to the Sepolia Testnet!');
        return;
      } else {
        setCorrectNetwork(true);
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      console.log('Found account', accounts[0]);
      setCurrentAccount(accounts[0]);
      toast.success('Wallet connected');
    } catch (error) {
      console.log('Error connecting to metamask', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      <header className="bg-blue-600 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-xl">Connect to Wallet</h1>
          {currentAccount === '' ? (
            <button className="bg-white text-blue-600 px-4 py-2 rounded" onClick={connectWallet}>
              Connect Wallet
            </button>
          ) : (
            <span className="text-white">{currentAccount}</span>
          )}
        </div>
      </header>
      <main className="container mx-auto mt-8">
        {currentAccount === '' ? (
          <div className="flex justify-center items-center h-64">
            <button className="bg-blue-600 text-white px-8 py-4 rounded" onClick={connectWallet}>
              Connect Wallet
            </button>
          </div>
        ) : correctNetwork ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-green-600 text-xl">Connected to Sepolia Testnet</p>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-600 text-xl">Please connect to the Sepolia Testnet</p>
          </div>
        )}
      </main>
    </div>
  );
}
