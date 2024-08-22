"use client";
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { Table, TableRow, TableBody, TableCell, TableHeader } from '@/components/ui/table';
import { PeerToPeerLendingContractAddress } from "@/config";
import abi from "../../../lib/LendingContract.json";
import { useParams } from "next/navigation";
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Loan {
  borrower: string;
  amount: string;
  mortgageCID: string;
  dueDate: string;
  status: number;
}

type AccountType = 'None' | 'Lender' | 'Borrower';

const AccountDashboard: React.FC = () => {
  const params = useParams();
  const accountAddress = params?.accountAddress as string | undefined;

  const [accountType, setAccountType] = useState<AccountType>('None');
  const [borrowerLoans, setBorrowerLoans] = useState<Loan[]>([]);
  const [lenderLoans, setLenderLoans] = useState<Loan[]>([]);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if ((window as any).ethereum) {
        const web3Instance = new Web3((window as any).ethereum);
        setWeb3(web3Instance);
        const contractInstance = new web3Instance.eth.Contract(abi.abi, PeerToPeerLendingContractAddress);
        setContract(contractInstance);
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    if (!accountAddress || !contract) return;

    const loadAccountDetails = async () => {
      try {
        const result = await contract.methods.getAccountDetails(accountAddress).call();
        const accountType = ['None', 'Lender', 'Borrower'][Number(result.accountType)] as AccountType;
        setAccountType(accountType);
        await loadBorrowerLoans(Number(result.borrowerLoanCount));
        await loadLenderLoans(Number(result.lenderLoanCount));
      } catch (error) {
        console.error('Error fetching account details:', error);
        toast.error("Error in getting  account details");
      }
    };

    loadAccountDetails();
  }, [accountAddress, contract]);

  const loadBorrowerLoans = async (count: number) => {
    if (!accountAddress) {
      toast.error("Account Adress Not found");
       return;
    }
    const loans: Loan[] = [];
    for (let i = 0; i < count; i++) {
      const loan = await contract.methods.getBorrowerLoan(accountAddress, i).call();
      loans.push({
        borrower: accountAddress,
        amount: loan.amount,
        mortgageCID: loan.mortgageCID,
        dueDate: loan.dueDate,
        status: Number(loan.status)
      });
    }
    setBorrowerLoans(loans);
  };

  const loadLenderLoans = async (count: number) => {
    const loans: Loan[] = [];
    for (let i = 0; i < count; i++) {
      const loan = await contract.methods.getLenderLoan(accountAddress, i).call();
      loans.push({
        borrower: loan.borrower,
        amount: loan.amount,
        mortgageCID: loan.mortgageCID,
        dueDate: loan.dueDate,
        status: Number(loan.status)
      });
    }
    setLenderLoans(loans);
  };

  if (!accountAddress) {
    return <div>Loading...</div>;
  }

  return (
    <div className='container mx-auto p-4'>

      {borrowerLoans.length > 0 && (
        <div>
          <Card>
          <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardTitle>Account Type: {accountType}</CardTitle>
          <CardDescription>See Your all Transactions here...</CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>MortgageCID</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowerLoans.map((loan, index) => (
                <TableRow key={index}>
                  <TableCell>{web3?.utils.fromWei(loan.amount, 'ether')} ETH</TableCell>
                  <TableCell>{loan.mortgageCID}</TableCell>
                  <TableCell>{new Date(Number(loan.dueDate) * 1000).toLocaleString()}</TableCell>
                  <TableCell>{['Requested', 'Funded', 'Repaid'][loan.status]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
          </Card>  
        </div>
      )}

      {lenderLoans.length > 0 && (
         <div>
         <Card>
         <CardHeader>
         <CardTitle>Dashboard</CardTitle>
         <CardTitle>Account Type: {accountType}</CardTitle>
         <CardDescription>See Your all Transactions here...</CardDescription>
       </CardHeader>
       <CardContent>
       <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Borrower</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>MortgageCID</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lenderLoans.map((loan, index) => (
                <TableRow key={index}>
                  <TableCell>{loan.borrower}</TableCell>
                  <TableCell>{web3?.utils.fromWei(loan.amount, 'ether')} ETH</TableCell>
                  <TableCell>{loan.mortgageCID}</TableCell>
                  <TableCell>{new Date(Number(loan.dueDate) * 1000).toLocaleString()}</TableCell>
                  <TableCell>{['Requested', 'Funded', 'Repaid'][loan.status]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
       </CardContent>
         </Card>  
       </div>
      )}
    </div>
  );
};

export default AccountDashboard;