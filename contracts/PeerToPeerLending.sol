// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract PeerToPeerLending {
    
    enum AccountType { None, Lender, Borrower }
    enum LoanStatus { Requested, Funded, Repaid }

    struct Loan {
        address borrower;
        address lender;
        uint256 amount;
        string mortgageCID;
        uint256 dueDate;
        LoanStatus status;
    }

    Loan[] public allLoans;
    mapping(address => AccountType) public accountTypes;
    mapping(address => Loan[]) public borrowerLoans;
    mapping(address => Loan[]) public lenderLoans;

    event LoanRequested(address indexed borrower, uint256 amount, string mortgageCID, uint256 dueDate);
    event LoanFunded(address indexed lender, address indexed borrower, uint256 amount);
    event LoanRepaid(address indexed borrower, address indexed lender, uint256 amount);

    // Borrower requests a loan
    function requestLoan(uint256 _amount, string memory _mortgageCID, uint256 _dueDate) external {
        require(_amount > 0, "Loan amount must be greater than 0");
        require(_dueDate > block.timestamp, "Due date must be in the future");

        // Set account type as Borrower if not already set
        if (accountTypes[msg.sender] == AccountType.None) {
            accountTypes[msg.sender] = AccountType.Borrower;
        }

        // Create the loan request
        Loan memory newLoan = Loan({
            borrower: msg.sender,
            lender: address(0), // No lender at the time of request
            amount: _amount,
            mortgageCID: _mortgageCID,   
            dueDate: _dueDate,
            status: LoanStatus.Requested
        });

        borrowerLoans[msg.sender].push(newLoan);
        allLoans.push(newLoan);   

        emit LoanRequested(msg.sender, _amount, _mortgageCID, _dueDate);
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
        loan.lender = msg.sender;
        lenderLoans[msg.sender].push(loan);

        // Update the corresponding loan in borrowerLoans
        borrowerLoans[loan.borrower][_loanIndex].status = LoanStatus.Funded;
        borrowerLoans[loan.borrower][_loanIndex].lender = msg.sender;
        
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
        payable(loan.lender).transfer(msg.value);

        emit LoanRepaid(msg.sender, loan.lender, msg.value);
    }

    // Get all loan requests 
    function getAllLoans() external view returns (Loan[] memory) {
        return allLoans;
    }

    function getAccountDetails(address _account) external view returns (
        uint8 accountType,
        uint256 borrowerLoanCount,
        uint256 lenderLoanCount
    ) {
        accountType = uint8(accountTypes[_account]);
        borrowerLoanCount = borrowerLoans[_account].length;
        lenderLoanCount = lenderLoans[_account].length;
    }

    //function to get a specific borrower loan details
    function getBorrowerLoan(address _borrower, uint256 _index) external view returns (
        uint256 amount,
        string memory mortgageCID,
        uint256 dueDate,
        LoanStatus status
    ) {
        require(_index < borrowerLoans[_borrower].length, "Loan index out of bounds");
        Loan storage loan = borrowerLoans[_borrower][_index];
        return (loan.amount, loan.mortgageCID, loan.dueDate, loan.status);
    }

    //function To get a specific lender loan details
    function getLenderLoan(address _lender, uint256 _index) external view returns (
        address borrower,
        uint256 amount,
        string memory mortgageCID,
        uint256 dueDate,
        LoanStatus status
    ) {
        require(_index < lenderLoans[_lender].length, "Loan index out of bounds");
        Loan storage loan = lenderLoans[_lender][_index];
        return (loan.borrower, loan.amount, loan.mortgageCID, loan.dueDate, loan.status);
    }
}
