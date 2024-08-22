"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/DatePicker";
import { Button } from "@/components/ui/button";
import { PeerToPeerLendingContractAddress } from "@/config";
import abi from "../../lib/LendingContract.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWallet } from "@/context/WalletContext";
import ConnectWallet from "@/components/ConnectWallet";
import { useRouter } from "next/navigation";

const contractABI = abi;
const contractAddress = PeerToPeerLendingContractAddress;

const Page = () => {
  const { web3, currentAccount, disconnectWallet } = useWallet();
  const [amount, setAmount] = useState("");
  const [mortgageCID, setMortgageCID] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!web3 || !currentAccount) {
      toast("Wallet not connected!");
      return;
    }
  
    try {
      if (!selectedDate) {
        toast("Please pick a due date.");
        return;
      }
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        toast.success("Please enter a valid loan amount in ETH.");
        return;
      }
      const contract = new web3.eth.Contract(contractABI.abi, contractAddress);
      const amountInWei = web3.utils.toWei(amount, "ether");
  
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 500000;  
  
      const tx = await contract.methods
        .requestLoan(amountInWei, mortgageCID, Math.floor(selectedDate.getTime() / 1000))
        .send({ 
          from: currentAccount,
          gasPrice: gasPrice.toString(),  
          gas: gasLimit.toString(),  
          type: '0x0'  
        });
  
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
      if (receipt && receipt.status) {
        toast.success("Loan Request Added to Network!");
        router.push(`/account/${currentAccount}`);
      } else {
        toast("Transaction failed.");
      }
    } catch (error: any) {
      console.log("Error creating loan:", error.message);
      toast(`Failed to create loan`);
    }
  };
  return (
    <div className="flex items-center justify-center">
      {currentAccount ? (
        <Card>
          <ToastContainer />
          <CardHeader>
            <CardTitle>Request a Loan!</CardTitle>
            <CardDescription>Submit your loan application and connect directly with 
              <br/> peers on our secure, blockchain-powered platform.
              </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="accountAddress">Account Address</Label>
                  <Input id="accountAddress" value={currentAccount || ""} readOnly />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="amount">Loan Amount (in ETH)</Label>
                  <Input
                    id="amount"
                    placeholder="Enter Loan Amount(in ETH)"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="mortgageCID">Add Mortgage</Label>
                  <Input
                    id="mortgageCID"
                    placeholder="Enter Mortgage CID"
                    value={mortgageCID}
                    onChange={(e) => setMortgageCID(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5 w-full">
                  <Label htmlFor="dueDate">Pick a Due Date</Label>
                  <DatePicker onDateChange={setSelectedDate} />
                </div>
                <Button type="submit">Request Loan</Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={disconnectWallet}>Cancel</Button>
          </CardFooter>
        </Card>
      ) : (
         <Card>
          <CardHeader>
            <CardTitle>You are not connected!</CardTitle>
            <CardDescription>Connet your wallet to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <ConnectWallet/>
          </CardContent>
         </Card>
      )}
    </div>
  );
};

export default Page;
