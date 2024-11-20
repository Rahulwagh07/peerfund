'use client'

import React, { useEffect, useState } from "react"
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import { CardContent , CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DatePicker } from "@/components/date-picker"
import { Button } from "@/components/ui/button"
import { CONTRACT_ADDRESS } from "@/lib/constant"
import { ABI } from "@/lib/constant"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useRouter } from "next/navigation"
import NotConnected from "@/components/not-connected"

export default function LoanRequest() {
  const { address, isConnected } = useAccount()
  const [amount, setAmount] = useState("")
  const [mortgageCID, setMortgageCID] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const router = useRouter()
  const { 
    data: hash,
    isPending, 
    writeContract 
  } = useWriteContract()

  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
  useWaitForTransactionReceipt({ 
    hash, 
})
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isConnected || !address) {
      toast.error("Wallet not connected!")
      return
    }

    if (!selectedDate) {
      toast.error("Please pick a due date")
      return
    }
  

    if (selectedDate.getTime() <= new Date().getTime()) {
      toast.error('Please select future date');
      return;
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid loan amount")
      return
    }

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'requestLoan',
        args: [
          parseEther(amount),
          mortgageCID,
          selectedDate ? Math.floor(selectedDate.getTime() / 1000) : 0
        ],
      })
    } catch (error) {
      console.error("Transaction error:", error)
      toast.error(`Transaction failed`)
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Loan request submitted!")
      router.push(`/account/${address}`)
    }
  }, [isConfirmed])

  return (
    <div className="flex items-center justify-center">
      <ToastContainer />
      {isConnected ? (
        <div className=" w-full p-4 sm:w-[550px] space-y-4">
          <CardHeader>
            <CardTitle>Request a Loan!</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-8">
                <div className="flex flex-col space-y-2.5">
                  <Label htmlFor="accountAddress">Account Address</Label>
                  <Input id="accountAddress" value={address || ""} readOnly />
                </div>
                <div className="flex flex-col space-y-2.5">
                  <Label htmlFor="amount">Loan Amount (in ETH)</Label>
                  <Input
                    id="amount"
                    placeholder="Enter Loan Amount (in ETH)"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2.5">
                  <Label htmlFor="mortgageCID">Add Mortgage</Label>
                  <Input
                    id="mortgageCID"
                    placeholder="Enter Mortgage CID"
                    value={mortgageCID}
                    onChange={(e) => setMortgageCID(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-2.5 w-full">
                  <Label htmlFor="dueDate">Pick a Due Date</Label>
                  <DatePicker onDateChange={setSelectedDate} />
                </div>
                <Button type="submit" disabled={isPending || isConfirming}>
                   {isPending ? 'Confirming...' : isConfirming ? 'Processing...' : 'Request Loan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
      ) : (
         <NotConnected/>
      )}
    </div>
  )
}