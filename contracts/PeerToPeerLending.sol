// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract PeerToPeerLending {
    enum AccountType {
        None,
        Lender,
        Borrower
    }
    enum LoanStatus {
        Requested,
        Funded,
        Closed,
        Defaulted
    }

    struct Loan {
        uint256 index;
        address borrower;
        address lender;
        uint256 amount;
        string mortgageCID;
        uint256 dueDate;
        LoanStatus status;
        uint256 requestDate;
        uint256 fundDate;
        uint256 repayDate;
        uint256 interestAccrued;
        bool isRepaid;
    }

    struct UserAccount {
        AccountType accountType;
        uint256 loanCount;
        uint256[] loanIndices;
    }

    mapping(address => UserAccount) public userAccounts;
    mapping(uint256 => Loan) public loans;
    uint256 public loanCounter;
    address[] public borrowers;

    uint256 constant ANNUAL_INTEREST_RATE = 20;
    uint256 constant MAX_LOANS = 5;

    event LoanRequested(
        uint256 indexed loanIndex,
        address indexed borrower,
        uint256 amount,
        string mortgageCID,
        uint256 dueDate
    );
    event LoanFunded(
        uint256 indexed loanIndex,
        address indexed lender,
        address indexed borrower,
        uint256 amount,
        uint256 fundDate
    );
    event LoanRepaid(
        uint256 indexed loanIndex,
        address indexed borrower,
        address indexed lender,
        uint256 amount,
        uint256 interestAccrued
    );

    error InvalidAmount();
    error InvalidDueDate();
    error LoanNotFundable();
    error LoanNotRepayable();
    error MaxLoansReached();
    error CannotLendAsBorrower();
    error CannotBorrowAsLender();

    function requestLoan(
        uint256 _amount,
        string memory _mortgageCID,
        uint256 _dueDate
    ) external {
        if (_amount == 0) revert InvalidAmount();
        if (_dueDate <= block.timestamp) revert InvalidDueDate();

        UserAccount storage userAccount = userAccounts[msg.sender];
        if (userAccount.accountType == AccountType.Lender)
            revert CannotBorrowAsLender();

        if (userAccount.loanCount >= MAX_LOANS) revert MaxLoansReached();

        loans[loanCounter] = Loan({
            index: loanCounter,
            borrower: msg.sender,
            lender: address(0),
            amount: _amount,
            mortgageCID: _mortgageCID,
            dueDate: _dueDate,
            status: LoanStatus.Requested,
            requestDate: block.timestamp,
            fundDate: 0,
            repayDate: 0,
            interestAccrued: 0,
            isRepaid: false
        });

        userAccount.loanIndices.push(loanCounter);
        userAccount.loanCount++;
        if (userAccount.accountType == AccountType.None) {
            userAccount.accountType = AccountType.Borrower;
            borrowers.push(msg.sender);
        }

        emit LoanRequested(
            loanCounter,
            msg.sender,
            _amount,
            _mortgageCID,
            _dueDate
        );
        loanCounter++;
    }

    function fundLoan(uint256 loanIndex) external payable {
        Loan storage loan = loans[loanIndex];

        if (loan.status != LoanStatus.Requested) revert LoanNotFundable();
        if (msg.value != loan.amount) revert InvalidAmount();

        UserAccount storage userAccount = userAccounts[msg.sender];

        if (userAccount.accountType == AccountType.None) {
            userAccount.accountType = AccountType.Lender;
        } else if (userAccount.accountType == AccountType.Borrower) {
            revert CannotLendAsBorrower();
        }

        loan.lender = msg.sender;
        loan.status = LoanStatus.Funded;
        loan.fundDate = block.timestamp;

        userAccount.loanIndices.push(loanIndex);
        userAccount.loanCount++;

        payable(loan.borrower).transfer(msg.value);

        emit LoanFunded(
            loanIndex,
            msg.sender,
            loan.borrower,
            msg.value,
            block.timestamp
        );
    }

    function repayLoan(uint256 loanIndex) external payable {
        Loan storage loan = loans[loanIndex];

        if (loan.status != LoanStatus.Funded) revert LoanNotRepayable();
        if (msg.sender != loan.borrower) revert InvalidAmount();

        uint256 timeElapsed = block.timestamp - loan.fundDate;
        uint256 SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
        uint256 PRECISION = 1e18;
        uint256 timeInYears = (timeElapsed * PRECISION) / SECONDS_PER_YEAR;
        uint256 interest = (loan.amount * ANNUAL_INTEREST_RATE * timeInYears) /
            (100 * PRECISION);

        uint256 totalRepayment = loan.amount + interest;

        loan.status = LoanStatus.Closed;
        loan.interestAccrued = interest;
        loan.repayDate = block.timestamp;
        loan.isRepaid = true;

        payable(loan.lender).transfer(msg.value);

        emit LoanRepaid(
            loanIndex,
            loan.borrower,
            loan.lender,
            totalRepayment,
            interest
        );
    }

    function getAccountDetails(
        address _user
    ) external view returns (AccountType accountType, Loan[] memory userLoans) {
        UserAccount storage userAccount = userAccounts[_user];

        uint256 loanCount = userAccount.loanCount;
        uint256[] memory indices = userAccount.loanIndices;
        userLoans = new Loan[](loanCount);

        for (uint256 i = 0; i < loanCount; i++) {
            userLoans[i] = loans[indices[i]];
        }

        return (userAccount.accountType, userLoans);
    }

    function getAllLoans() external view returns (Loan[] memory allLoans) {
        allLoans = new Loan[](loanCounter);
        for (uint256 i = 0; i < loanCounter; i++) {
            allLoans[i] = loans[i];
        }
        return allLoans;
    }
}
