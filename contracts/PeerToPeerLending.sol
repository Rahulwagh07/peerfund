// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract PeerToPeerLending {
    
    enum AccountType { None, Lender, Borrower }
    enum LoanStatus { Requested, Funded, Repaid }

    struct Loan {
        address borrower;
        uint256 amount;
        address mortgageAddress;
        uint256 dueDate;
        LoanStatus status;
    }

    Loan[] public allLoans;  // Array to store all loan requests
    mapping(address => AccountType) public accountTypes;
    mapping(address => Loan[]) public borrowerLoans;
    mapping(address => Loan[]) public lenderLoans;

    event LoanRequested(address indexed borrower, uint256 amount, address mortgageAddress, uint256 dueDate);
    event LoanFunded(address indexed lender, address indexed borrower, uint256 amount);
    event LoanRepaid(address indexed borrower, address indexed lender, uint256 amount);

    // Borrower requests a loan
    function requestLoan(uint256 _amount, address _mortgageAddress, uint256 _dueDate) external {
        require(_amount > 0, "Loan amount must be greater than 0");
        require(_dueDate > block.timestamp, "Due date must be in the future");

        // Set account type as Borrower if not already set
        if (accountTypes[msg.sender] == AccountType.None) {
            accountTypes[msg.sender] = AccountType.Borrower;
        }

        // Create the loan request
        Loan memory newLoan = Loan({
            borrower: msg.sender,
            amount: _amount,
            mortgageAddress: _mortgageAddress,
            dueDate: _dueDate,
            status: LoanStatus.Requested
        });

        borrowerLoans[msg.sender].push(newLoan);
        allLoans.push(newLoan);  // Add to the allLoans array

        emit LoanRequested(msg.sender, _amount, _mortgageAddress, _dueDate);
    }

    // Lender funds the loan
    function fundLoan(uint256 _loanIndex) external payable {
        Loan storage loan = allLoans[_loanIndex];
        require(loan.status == LoanStatus.Requested, "Loan is not in a fundable state");
        require(msg.value == loan.amount, "Incorrect loan amount sent");

        // Set account type as Lender if not already set
        if (accountTypes[msg.sender] == AccountType.None) {
            accountTypes[msg.sender] = AccountType.Lender;
        }

        loan.status = LoanStatus.Funded;
        lenderLoans[msg.sender].push(loan);

        // Transfer the loan amount to the borrower
        payable(loan.borrower).transfer(msg.value);

        emit LoanFunded(msg.sender, loan.borrower, msg.value);
    }

    // Borrower repays the loan
    function repayLoan(uint256 _loanIndex) external payable {
        Loan storage loan = borrowerLoans[msg.sender][_loanIndex];
        require(loan.status == LoanStatus.Funded, "Loan is not in a repayable state");
        require(msg.value == loan.amount, "Incorrect repayment amount sent");

        loan.status = LoanStatus.Repaid;

        // Transfer the repayment amount to the lender
        payable(loan.borrower).transfer(msg.value);

        emit LoanRepaid(msg.sender, loan.borrower, msg.value);
    }

    // Get all loan requests for the "Explore" page
    function getAllLoans() external view returns (Loan[] memory) {
        return allLoans;
    }

    // Get borrower's loan details
    function getBorrowerLoans(address _borrower) external view returns (Loan[] memory) {
        return borrowerLoans[_borrower];
    }

    // Get lender's loan details
    function getLenderLoans(address _lender) external view returns (Loan[] memory) {
        return lenderLoans[_lender];
    }
}
