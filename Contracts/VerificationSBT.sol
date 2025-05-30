// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./UserRegistry.sol";
import "./VisaSBT.sol";

interface ILoanUserRegistry {
    function isUserVerified(address user) external view returns (bool);
    function revokeVerificationSBT(address userAddress) external;
    function getVerificationTokenId(address userAddress) external view returns (uint256);
    function getUserStatus(address userAddress) external view returns (UserRegistry.ApplicationStatus);
}

interface ILoanVisaSBT {
    function setVisaStatus(uint256 tokenId, bool active) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function getUserVisaTokenId(address user) external view returns (uint256);
}

contract LoanContract is Ownable, ReentrancyGuard {
    ILoanUserRegistry public userRegistry;
    ILoanVisaSBT public visaSBT;

    uint256 public constant LOAN_TERM_SECONDS = 90 days;
    int256 public constant CREDIT_SCORE_REPAYMENT_BONUS = 10;
    int256 public constant CREDIT_SCORE_DEFAULT_PENALTY = -20;
    uint256 public constant MAX_CONCURRENT_LOANS = 1;

    enum LoanStatus { None, Requested, Approved, Active, Repaid, Defaulted, Cancelled }

    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 requestTime;
        uint256 startTime;
        uint256 dueDate;
        LoanStatus status;
        bool fundsDisbursed;
    }

    mapping(address => Loan[]) public loanHistory;
    mapping(address => uint256) public activeLoanCount;
    mapping(address => int256) public creditScores;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256) public currentActiveLoanId; // Track current active loan
    
    uint256 private nextLoanId;
    address[] public pendingLoanApprovals;
    mapping(address => uint256) public userToPendingLoanId;

    event LoanRequested(address indexed borrower, uint256 loanId, uint256 amount);
    event LoanApproved(uint256 indexed loanId, address indexed approver);
    event LoanDisbursed(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower);
    event CreditScoreUpdated(address indexed user, int256 newScore);

    constructor(address initialOwner, address _userRegistryAddress, address _visaSBTAddress) 
        Ownable(initialOwner) 
    {
        userRegistry = ILoanUserRegistry(_userRegistryAddress);
        visaSBT = ILoanVisaSBT(_visaSBTAddress);
        nextLoanId = 1; // Start from 1 to avoid 0 confusion
    }

    // User Functions
    function requestLoan(uint256 _amount) public nonReentrant {
        require(userRegistry.isUserVerified(msg.sender), "LoanContract: User not verified");
        require(userRegistry.getUserStatus(msg.sender) != UserRegistry.ApplicationStatus.Banned, "LoanContract: User is banned");
        require(activeLoanCount[msg.sender] < MAX_CONCURRENT_LOANS, "LoanContract: Max concurrent loans reached");
        require(_amount > 0, "LoanContract: Loan amount must be positive");
        require(userToPendingLoanId[msg.sender] == 0, "LoanContract: Previous loan request still pending approval");

        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: _amount,
            requestTime: block.timestamp,
            startTime: 0,
            dueDate: 0,
            status: LoanStatus.Requested,
            fundsDisbursed: false
        });

        pendingLoanApprovals.push(msg.sender);
        userToPendingLoanId[msg.sender] = loanId;

        emit LoanRequested(msg.sender, loanId, _amount);
    }

    function repayLoan(uint256 _loanId) public payable nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "LoanContract: Not your loan");
        require(loan.status == LoanStatus.Active, "LoanContract: Loan not active");
        require(msg.value >= loan.amount, "LoanContract: Insufficient repayment amount");

        // Transfer received funds to owner/treasury
        payable(owner()).transfer(loan.amount);
        if (msg.value > loan.amount) {
            payable(msg.sender).transfer(msg.value - loan.amount);
        }

        loan.status = LoanStatus.Repaid;
        activeLoanCount[msg.sender]--;
        currentActiveLoanId[msg.sender] = 0; // Clear active loan ID
        
        // Add to history
        loanHistory[msg.sender].push(loan);

        creditScores[msg.sender] += CREDIT_SCORE_REPAYMENT_BONUS;
        emit CreditScoreUpdated(msg.sender, creditScores[msg.sender]);
        emit LoanRepaid(_loanId, msg.sender, loan.amount);
    }

    // Admin/Owner Functions
    function approveLoanRequest(uint256 _loanId) public onlyOwner {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Requested, "LoanContract: Loan not in requested state");
        
        loan.status = LoanStatus.Approved;

        // Remove from pending list
        _removeFromPendingList(loan.borrower, _loanId);
        emit LoanApproved(_loanId, msg.sender);
    }

    function disburseLoan(uint256 _loanId) public payable onlyOwner nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Approved, "LoanContract: Loan not approved for disbursal");
        require(msg.value == loan.amount, "LoanContract: Incorrect disbursement amount sent with transaction");
        require(!loan.fundsDisbursed, "LoanContract: Funds already disbursed for this loan");

        loan.startTime = block.timestamp;
        loan.dueDate = block.timestamp + LOAN_TERM_SECONDS;
        loan.status = LoanStatus.Active;
        loan.fundsDisbursed = true;
        
        activeLoanCount[loan.borrower]++;
        currentActiveLoanId[loan.borrower] = _loanId; // Track active loan

        payable(loan.borrower).transfer(loan.amount);
        emit LoanDisbursed(_loanId, loan.borrower, loan.amount);
    }

    function processLoanDefault(uint256 _loanId) public onlyOwner {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "LoanContract: Loan not active");
        require(block.timestamp > loan.dueDate, "LoanContract: Loan not yet overdue");

        loan.status = LoanStatus.Defaulted;
        activeLoanCount[loan.borrower]--;
        currentActiveLoanId[loan.borrower] = 0; // Clear active loan ID
        
        // Add to history
        loanHistory[loan.borrower].push(loan);

        creditScores[loan.borrower] += CREDIT_SCORE_DEFAULT_PENALTY;
        emit CreditScoreUpdated(loan.borrower, creditScores[loan.borrower]);

        // Revoke SBTs
        userRegistry.revokeVerificationSBT(loan.borrower);

        // Disable VISA SBT
        uint256 visaTokenId = visaSBT.getUserVisaTokenId(loan.borrower);
        if (visaTokenId != 0) {
            try visaSBT.ownerOf(visaTokenId) returns (address owner) {
                if (owner == loan.borrower) {
                    visaSBT.setVisaStatus(visaTokenId, false);
                }
            } catch {
                // Token doesn't exist or already burned
            }
        }

        emit LoanDefaulted(_loanId, loan.borrower);
    }

    // View Functions
    function getActiveLoanDetails(address _userAddress) public view returns (Loan memory) {
        require(activeLoanCount[_userAddress] > 0, "LoanContract: No active loan");
        uint256 activeLoanId = currentActiveLoanId[_userAddress];
        require(activeLoanId != 0, "LoanContract: No active loan ID found");
        return loans[activeLoanId];
    }

    function getLoanHistory(address _userAddress) public view returns (Loan[] memory) {
        return loanHistory[_userAddress];
    }

    function getCreditScore(address _userAddress) public view returns (int256) {
        return creditScores[_userAddress];
    }

    function getDaysLeftForLoan(address _userAddress) public view returns (uint256) {
        if (activeLoanCount[_userAddress] == 0) {
            return 0;
        }
        
        uint256 activeLoanId = currentActiveLoanId[_userAddress];
        if (activeLoanId == 0) {
            return 0;
        }
        
        Loan memory activeLoan = loans[activeLoanId];
        if (activeLoan.status == LoanStatus.Active && activeLoan.dueDate > block.timestamp) {
            return (activeLoan.dueDate - block.timestamp) / 1 days;
        }
        return 0;
    }

    function getPendingLoanApprovals() public view onlyOwner returns (address[] memory) {
        return pendingLoanApprovals;
    }
    
    function getUserPendingLoanId(address _user) public view onlyOwner returns (uint256) {
        return userToPendingLoanId[_user];
    }

    function getLoanById(uint256 _loanId) public view returns (Loan memory) {
        return loans[_loanId];
    }

    // Internal Functions
    function _removeFromPendingList(address _userAddress, uint256 _loanId) internal {
        for (uint i = 0; i < pendingLoanApprovals.length; i++) {
            if (pendingLoanApprovals[i] == _userAddress && userToPendingLoanId[_userAddress] == _loanId) {
                pendingLoanApprovals[i] = pendingLoanApprovals[pendingLoanApprovals.length - 1];
                pendingLoanApprovals.pop();
                userToPendingLoanId[_userAddress] = 0;
                break;
            }
        }
    }

    // Contract Management
    function setUserRegistryAddress(address _newUserRegistryAddress) public onlyOwner {
        userRegistry = ILoanUserRegistry(_newUserRegistryAddress);
    }

    function setVisaSBTAddress(address _newVisaSBTAddress) public onlyOwner {
        visaSBT = ILoanVisaSBT(_newVisaSBTAddress);
    }

    // Emergency function to withdraw contract balance
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}