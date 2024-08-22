import React from 'react'
import ConnectWallet from './ConnectWallet'
import Link from 'next/link'

function Appbar() {
  return (
    <header className='flex justify-between items-center align-baseline px-8  shadow-lg 
     dark:bg-gray-900 border-b mb-4 p-2   dark:border-slate-800'>
      <Link href={"/"} className='font-bold text-2xl'>PeerFund</Link>
      <ConnectWallet/>
    </header>
  )
}

export default Appbar