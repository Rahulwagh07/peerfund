"use client";

import React, { useState } from "react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { CONTRACT_ADDRESS } from "@/lib/constant";
import { useParams } from "next/navigation";
import { CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useAccount, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { AccountType, Loan, LoanStatus } from "@/types";
import {
  formatAddress,
} from "@/lib/utils";
import RepayLoanModal from "@/components/repay-loan";
import { ABI } from "@/lib/constant";
import {Loader} from "@/components/loader";
import NotConnected from "@/components/not-connected";

const AccountDashboard: React.FC = () => {
  const params = useParams();
  const accountAddress = params?.accountAddress as string | undefined;
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isConnected } = useAccount();

  const {
    data: accountDetails,
    isLoading,
    isError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getAccountDetails",
    args: [accountAddress],
  });

  if (isLoading) {
    return <Loader size="large" />;
  }

  if (isError || !accountDetails) {
    return <div>Error fetching account details</div>;
  }

  const [accountType, loans] = accountDetails as [AccountType, Loan[]];

  const handleShowLoanDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setIsDialogOpen(true);
  };

  if (!isConnected) {
    return <NotConnected />;
  }
  return (
    <div className="container mx-auto p-4">
      {AccountType[accountType] === "None" ? (
        <CardDescription className="text-center text-xl dark:text-white mt-20">
          You don&apos;t have any Transaction!
        </CardDescription>
      ) : (
        <>
          <div>
            <CardHeader>
              <CardDescription>
                Account Type:{" "}
                <span className="dark:text-white font-semibold text-lg">
                  {AccountType[accountType]}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Borrower</TableCell>
                    <TableCell>Lender</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>MortgageCID</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell
                      className={`${
                        AccountType[accountType] === "Lender" &&
                        "hidden"
                      }`}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans?.length > 0 &&
                    loans.map((loan, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatAddress(loan.borrower)}</TableCell>
                        <TableCell>{formatAddress(loan.lender)}</TableCell>
                        <TableCell>{formatEther(loan.amount)} ETH</TableCell>
                        <TableCell>{formatAddress(loan.mortgageCID)}</TableCell>
                        <TableCell>
                          {new Date(
                            Number(loan.dueDate) * 1000
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {LoanStatus[loan.status]}
                        </TableCell>
                        <TableCell
                          className={`${
                            AccountType[accountType] === "Lender" &&
                            "hidden"
                          }`}
                        >
                          <Button
                            disabled={
                              LoanStatus[loan.status] !== "Funded"
                            }
                            onClick={() => handleShowLoanDetails(loan)}
                          >
                            Show Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </div>
          {selectedLoan && (
            <RepayLoanModal
              loan={selectedLoan}
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AccountDashboard;
