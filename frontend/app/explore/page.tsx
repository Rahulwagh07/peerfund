"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PeerToPeerLendingContractAddress } from "@/config";
import abi from "../../lib/LendingContract.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWallet } from "@/context/WalletContext";
import ConnectWallet from "@/components/ConnectWallet";
import { Button } from "@/components/ui/button";
import LoanDetailModal from "@/components/LoanDetailModal";

const contractABI = abi;
const contractAddress = PeerToPeerLendingContractAddress;

interface Loan {
  index: number;
  borrower: string;
  amount: string;
  mortgageCID: string;
  dueDate: string;
  status: string;
}

const Page = () => {
  const { web3, currentAccount } = useWallet();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

 
const fetchLoans = async () => {
    if (!web3) {
        setError("Web3 not initialized");
        setIsLoading(false);
        return;
    }

    try {
        const contract = new web3.eth.Contract(contractABI.abi, contractAddress);
        const fetchedLoans = await contract.methods.getAllLoans().call();

        const formattedLoans = fetchedLoans?.map((loan: any, index: number) => ({
            index,  
            borrower: loan.borrower,
            amount: web3.utils.fromWei(loan.amount, "ether"),
            mortgageCID: loan.mortgageCID,
            dueDate: new Date(Number(loan.dueDate) * 1000).toLocaleDateString(),
            status: ["Requested", "Funded", "Repaid"][Number(loan.status)]
        }));

        setLoans(formattedLoans!);
    } catch (err: any) {
        console.error("Error fetching loans:", err);
        setError(err.message);
        toast.error(`Failed to fetch loans: ${err.message}`);
    } finally {
        setIsLoading(false);
    }
};
  useEffect(() => {
    if (web3 && currentAccount) {
      fetchLoans();
    }
  }, [web3, currentAccount]);

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
  };

  const handleCloseModal = () => {
    setSelectedLoan(null);
  };

  if (!currentAccount) {
    return (
      <div className="flex flex-col items-center justify-center">
       <Card>
          <CardHeader>
            <CardTitle>You are not connected!</CardTitle>
            <CardDescription>Connet your wallet to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectWallet/>
          </CardContent>
         </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <Card>
        <CardHeader>
          <CardTitle>Explore Loans</CardTitle>
          <CardDescription>View all available loan requests on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading loans...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Amount (ETH)</TableHead>
                  <TableHead>Mortgage CID</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan, index) => (
                  <TableRow key={index}>
                    <TableCell>{loan.borrower}</TableCell>
                    <TableCell>{loan.amount}</TableCell>
                    <TableCell>{loan.mortgageCID}</TableCell>
                    <TableCell>{loan.dueDate}</TableCell>
                    <TableCell>{loan.status}</TableCell>
                    <TableCell>
                        <Button
                          onClick={() => handleViewDetails(loan)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {selectedLoan && (
              <LoanDetailModal
                loan={selectedLoan}
                onClose={handleCloseModal}
              />
            )} 
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;