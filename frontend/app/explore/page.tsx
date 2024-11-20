'use client'

import React, { useState, useEffect } from "react"
import {CardContent} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CONTRACT_ADDRESS } from "@/lib/constant"
import { ABI } from "@/lib/constant"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Button } from "@/components/ui/button"
import LoanDetailModal from "@/components/fund-laon"
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { Loan, LoanStatus } from "@/types"
import {Loader} from "@/components/loader"
import { formatAddress } from "@/lib/utils"

const ExploreLoanPage = () => {
  const [loans, setLoans] = useState<Loan[]>([])
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
  const [activeTab, setActiveTab] = useState('all')

  const { data: loansData, isLoading, isError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getAllLoans'
  })

  useEffect(() => {   
    if (loansData) {
      setLoans(loansData as Loan[])
    }
    
    if (isError) {
      toast.error("Error fetching loans")
    }
  }, [loansData, isError])

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan)
  }

  const handleCloseModal = () => {
    setSelectedLoan(null)
  }

  const tabs = [
    { value: 'all', label: 'All Loans' },
    { value: 'requested', label: 'Requested' },
    { value: 'funded', label: 'Funded' },
    { value: 'closed', label: 'Closed' },
    { value: 'defaulted', label: 'Defaulted' }
  ]

  const getFilteredLoans = (status?: LoanStatus) => {
    return status !== undefined 
      ? loans.filter(loan => loan.status === status)
      : loans
  }

  const renderTable = (filteredLoans: Loan[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Borrower</TableHead>
          <TableHead>Lender</TableHead>
          <TableHead>Amount (ETH)</TableHead>
          <TableHead>Mortgage CID</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredLoans.map((loan, index) => (
          <TableRow key={index}>
            <TableCell>{formatAddress(loan.borrower)}</TableCell>
            <TableCell>{formatAddress(loan.lender)}</TableCell>
            <TableCell>{formatEther(loan.amount)} ETH</TableCell>
            <TableCell>{formatAddress(loan.mortgageCID)}</TableCell>
            <TableCell>{new Date(Number(loan.dueDate) * 1000).toLocaleDateString()}</TableCell>
            <TableCell>{LoanStatus[loan.status]}</TableCell>
            <TableCell>
              <Button onClick={() => handleViewDetails(loan)}>
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="w-full mx-auto p-4">
      <ToastContainer />
      <div>
        <CardContent>
          {isLoading ? (
              <Loader size="small"/>
          ) : (
            <>
              <div className="hidden sm:flex justify-center mb-6">
                <div className="flex space-x-1 p-1 sm:p-2 bg-slate-800 rounded-full border border-gray-700 shadow-lg">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`
                       px-2 py-1 sm:px-4 sm:py-2 rounded-full text-sm font-medium
                        transition-all duration-300 ease-in-out
                        ${activeTab === tab.value 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-gray-100'}
                        focus:outline-none
                        transform hover:scale-105
                      `}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

      
              {activeTab === 'all' && renderTable(getFilteredLoans())}
              {activeTab === 'requested' && renderTable(getFilteredLoans(LoanStatus.Requested))}
              {activeTab === 'funded' && renderTable(getFilteredLoans(LoanStatus.Funded))}
              {activeTab === 'closed' && renderTable(getFilteredLoans(LoanStatus.Closed))}
              {activeTab === 'defaulted' && renderTable(getFilteredLoans(LoanStatus.Defaulted))}

              {selectedLoan && (
                <LoanDetailModal
                  loan={selectedLoan}
                  onClose={handleCloseModal}
                />
              )}
            </>
          )}
        </CardContent>
      </div>
    </div>
  )
}

export default ExploreLoanPage