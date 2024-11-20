"use client"

import React, { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi"
import { formatEther } from "viem"
import { CONTRACT_ADDRESS } from "@/lib/constant"
import { ABI } from "@/lib/constant"
import { Loan } from "@/types"
import { calculateInterest } from "@/lib/utils"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

interface RepayLoanModalProps {
  loan: Loan
  isOpen: boolean
  onClose: () => void
}

export default function RepayLoanModal({
  loan,
  isOpen,
  onClose,
}: RepayLoanModalProps) {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { data: hash, isPending, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  const handleRepayLoan = async () => {
    if (!isConnected || !address) {
      toast.error("Wallet not connected!")
      return
    }

    try {
      const calculatedInterest = calculateInterest(
        Number(loan.fundDate),
        Number(loan.amount)
      )
      const totalRepayment = loan.amount + calculatedInterest

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: "repayLoan",
        args: [BigInt(loan.index)],
        value: totalRepayment,
      })
    } catch (error) {
      toast.error("Transaction failed to repay loan")
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Loan Repaid successfully!")
      onClose()
    }
  }, [isConfirmed])

  const calculatedInterest = calculateInterest(
    Number(loan.fundDate),
    Number(loan.amount)
  )
  const totalRepayment = loan.amount + calculatedInterest

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Loan Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="loanAmount" className="text-right">
              Loan Amount:
            </Label>
            <Input
              id="loanAmount"
              value={`${formatEther(loan.amount)} ETH`}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="interest" className="text-right">
              Interest:
            </Label>
            <Input
              id="interest"
              value={`${formatEther(calculatedInterest)} ETH`}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalRepayment" className="text-right">
              Total Repayment:
            </Label>
            <Input
              id="totalRepayment"
              value={`${formatEther(totalRepayment)} ETH`}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fundedDate" className="text-right">
              Funded Date:
            </Label>
            <Input
              id="fundedDate"
              value={new Date(Number(loan.fundDate) * 1000).toLocaleString()}
              className="col-span-3"
              readOnly
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date:
            </Label>
            <Input
              id="dueDate"
              value={new Date(Number(loan.dueDate) * 1000).toLocaleString()}
              className="col-span-3"
              readOnly
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRepayLoan} disabled={isPending || isConfirming}>
            {isPending
              ? "Confirming..."
              : isConfirming
              ? "Processing..."
              : "Repay Loan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}