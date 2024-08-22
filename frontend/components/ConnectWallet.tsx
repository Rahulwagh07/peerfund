"use client";

import React from 'react';
import { Button } from './ui/button';
import { useWallet } from '@/context/WalletContext';
import { ToastContainer } from 'react-toastify';
import { formatAddress } from '@/lib/utils';

export default function ConnectWallet() {
  const { currentAccount, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      {currentAccount === '' ? (
        <Button size="lg" onClick={connectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Button size="lg" onClick={disconnectWallet}>
          {formatAddress(currentAccount)}
        </Button>
      )}
    </div>
  );
}
