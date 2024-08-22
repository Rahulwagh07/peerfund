import React, { useState } from "react";
import { PeerToPeerLendingContractAddress } from "@/config";
import abi from "../lib/LendingContract.json";
import { useWallet } from "@/context/WalletContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

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

interface LoanDetailModalProps {
  loan: Loan;
  onClose: () => void;
}

const LoanDetailModal: React.FC<LoanDetailModalProps> = ({ loan, onClose }) => {
  const { web3, currentAccount } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fundLoan = async () => {
    if (!web3 || !currentAccount) {
        toast.error("Account not initialized");
        return;
    }

    setIsLoading(true);

    try {
        const contract = new web3.eth.Contract(contractABI.abi, contractAddress);
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 4000000;

        const amountInWei = web3.utils.toWei(loan.amount, "ether");
        
        const tx = await contract.methods.fundLoan(loan.index).send({
            from: currentAccount,
            value: amountInWei,
            gas: gasLimit.toString(),
            gasPrice: gasPrice.toString()
        });
        
        const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
        if (receipt && receipt.status) {
            toast.success("Loan funded successfully!");
            router.push(`/account/${currentAccount}`)
        } else {
            toast.error("Transaction failed.");
        }
    } catch (error: any) {
        console.log("Error funding loan:", error);
        toast.error(`Failed to fund loan`);
    } finally {
        setIsLoading(false);
    }
};
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
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-start gap-1">
            <Label>
              Borrower Account
            </Label>
            <div
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {loan.borrower}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>
              Amount
            </Label>
            <div
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {loan.amount} <b className="text-red-500 ml-1">ETH</b>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>
              Due Date
            </Label>
            <div
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {loan.dueDate}
            </div>
          </div>
          <div className="flex flex-col items-start gap-1">
            <Label>
              Mortgage
            </Label>
            <div
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {loan.mortgageCID}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex justify-end p-4">
            <Button onClick={onClose} variant="outline">Close</Button>
            <Button
              onClick={fundLoan}
              className="ml-2"
              disabled={isLoading}
            >
              {isLoading ? "Funding..." : "Give Loan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      <ToastContainer />
    </Dialog>
  );
};

export default LoanDetailModal;
