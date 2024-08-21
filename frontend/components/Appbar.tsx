import React from 'react'
import ConnectWallet from './ConnectWallet'

function Appbar() {
  return (
    <header className='flex justify-end mt-2 p-2 shadow-lg'>
      <ConnectWallet/>
    </header>
  )
}

export default Appbar