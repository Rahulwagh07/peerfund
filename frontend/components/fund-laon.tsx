'use client'

import React, { useEffect } from "react"
import { ABI, CONTRACT_ADDRESS } from "@/lib/constant"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ToastContainer, toast } from "react-toastify"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { 
  useAccount, 
  useWaitForTransactionReceipt,
  useWriteContract
} from 'wagmi'
import { formatEther } from 'viem'
import { Loan } from "@/types"

interface FundLoanModalModalProps {
  loan: Loan
  onClose: () => void
}

export default function FundLoanModal({ loan, onClose }: FundLoanModalModalProps) {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  const { 
    data: hash,
    isPending, 
    writeContract 
  } = useWriteContract() 

 

  const handleFundLoan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isConnected || !address) {
      toast.error("Wallet not connected!")
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'fundLoan',
        args: [BigInt(loan.index)],
        value: BigInt(loan.amount.toString())
      })
      
    } catch (error) {
      console.error("Transaction error:", error)
      toast.error('Tranaction Failed')
    }
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ 
      hash, 
  })

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Loan funded successfully!")
      router.push(`/account/${address}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <ToastContainer />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loan Details</DialogTitle>
          <DialogDescription>
            Check the details before giving the loan.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFundLoan}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-1">
              <Label>Borrower Account</Label>
              <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                {loan.borrower}
              </div>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Label>Amount</Label>
              <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                {formatEther(loan.amount)} <b className="text-red-500 ml-1">ETH</b>
              </div>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Label>Due Date</Label>
              <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                {new Date(Number(loan.dueDate) * 1000).toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-start gap-1">
              <Label>Mortgage</Label>
              <div className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm">
                {loan.mortgageCID}
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end p-4">
              <Button onClick={onClose} type="button" variant="outline">Close</Button>
              <Button
                type="submit"
                className="ml-2"
                disabled={isPending || isConfirming}
              >
                {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Give Loan'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}