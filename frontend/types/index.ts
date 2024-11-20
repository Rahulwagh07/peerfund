export enum AccountType {
  None,
  Lender,
  Borrower
}
 
export enum LoanStatus {
  Requested,
  Funded,
  Closed,
  Defaulted
}

export interface Loan {
  index: number
  borrower: `0x${string}`
  lender: `0x${string}`
  amount: bigint
  mortgageCID: string
  dueDate: bigint
  status: LoanStatus
  requestDate: bigint
  fundDate: bigint
  repayDate: bigint
  interestAccrued: bigint
  isRepaid: boolean
}