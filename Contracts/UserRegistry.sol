// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VerificationSBT.sol";

interface IVerificationChecker {
    function isVerified(address user) external view returns (bool);
}

contract UserRegistry is AccessControl, IVerificationChecker {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    VerificationSBT public verificationSBT;

    enum ApplicationStatus { None, Pending, Approved, Rejected, Banned }

    struct UserApplication {
        address userAddress;
        string documentCID;
        ApplicationStatus status;
        uint256 verificationTokenId;
        bool sbtMinted;
    }

    mapping(address => UserApplication) public userApplications;
    address[] public pendingApplications;

    event UserApplied(address indexed user, string documentCID);
    event UserApproved(address indexed user, uint256 verificationTokenId);
    event UserRejected(address indexed user);
    event UserBanned(address indexed user);
    event VerificationSBTRevoked(address indexed user, uint256 verificationTokenId);

    constructor(address _verificationSBTAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        verificationSBT = VerificationSBT(_verificationSBTAddress);
    }

    // User Functions
    function applyForVerification(string memory _documentCID) public {
        require(
            userApplications[msg.sender].status == ApplicationStatus.None ||
            userApplications[msg.sender].status == ApplicationStatus.Rejected,
            "UserRegistry: Application already exists or user is banned/approved"
        );
        require(bytes(_documentCID).length > 0, "UserRegistry: Document CID cannot be empty");

        userApplications[msg.sender] = UserApplication({
            userAddress: msg.sender,
            documentCID: _documentCID,
            status: ApplicationStatus.Pending,
            verificationTokenId: 0,
            sbtMinted: false
        });
        
        // Add to pending list
        bool found = false;
        for(uint i = 0; i < pendingApplications.length; i++){
            if(pendingApplications[i] == msg.sender){
                found = true;
                break;
            }
        }
        if(!found){
             pendingApplications.push(msg.sender);
        }

        emit UserApplied(msg.sender, _documentCID);
    }

    // Admin Functions
    function approveUser(address _userAddress, string memory _verificationTokenURI) public onlyRole(ADMIN_ROLE) {
        UserApplication storage application = userApplications[_userAddress];
        require(application.status == ApplicationStatus.Pending, "UserRegistry: No pending application or already processed");

        application.status = ApplicationStatus.Approved;
        
        uint256 tokenId = verificationSBT.mint(_userAddress, _verificationTokenURI);
        application.verificationTokenId = tokenId;
        application.sbtMinted = true;

        // Remove from pending list
        _removeFromPendingList(_userAddress);
        emit UserApproved(_userAddress, tokenId);
    }

    function rejectUser(address _userAddress) public onlyRole(ADMIN_ROLE) {
        UserApplication storage application = userApplications[_userAddress];
        require(application.status == ApplicationStatus.Pending, "UserRegistry: No pending application or already processed");
        
        application.status = ApplicationStatus.Rejected;
        _removeFromPendingList(_userAddress);
        emit UserRejected(_userAddress);
    }

    function banUser(address _userAddress) public onlyRole(ADMIN_ROLE) {
        UserApplication storage application = userApplications[_userAddress];
        require(application.userAddress != address(0), "UserRegistry: User not found");
        
        if (application.sbtMinted && application.verificationTokenId > 0) {
            try verificationSBT.ownerOf(application.verificationTokenId) returns (address owner) {
                if (owner == _userAddress) {
                    verificationSBT.burn(application.verificationTokenId);
                    emit VerificationSBTRevoked(_userAddress, application.verificationTokenId);
                }
            } catch {
                // Token doesn't exist or already burned
            }
            application.sbtMinted = false;
        }
        
        application.status = ApplicationStatus.Banned;
        emit UserBanned(_userAddress);
    }

    function revokeVerificationSBT(address _userAddress) external {
        UserApplication storage application = userApplications[_userAddress];
        require(application.sbtMinted, "UserRegistry: No SBT minted for user");

        try verificationSBT.ownerOf(application.verificationTokenId) returns (address owner) {
            if (owner == _userAddress) {
                verificationSBT.burn(application.verificationTokenId);
                emit VerificationSBTRevoked(_userAddress, application.verificationTokenId);
            }
        } catch {
            // Token doesn't exist or already burned
        }
        
        application.sbtMinted = false;
        application.status = ApplicationStatus.Banned;
        emit UserBanned(_userAddress);
    }

    // View Functions
    function getUserStatus(address _userAddress) public view returns (ApplicationStatus) {
        return userApplications[_userAddress].status;
    }

    function isUserVerified(address _userAddress) public view returns (bool) {
        return userApplications[_userAddress].status == ApplicationStatus.Approved && 
               userApplications[_userAddress].sbtMinted;
    }

    function isVerified(address _userAddress) public view returns (bool) {
        return isUserVerified(_userAddress);
    }

    function getVerificationTokenId(address _userAddress) public view returns (uint256) {
        require(isUserVerified(_userAddress), "UserRegistry: User not verified or SBT not minted");
        return userApplications[_userAddress].verificationTokenId;
    }
    
    function getPendingApplications() public view onlyRole(ADMIN_ROLE) returns (address[] memory) {
        return pendingApplications;
    }

    // Internal Functions
    function _removeFromPendingList(address _userAddress) internal {
        for (uint i = 0; i < pendingApplications.length; i++) {
            if (pendingApplications[i] == _userAddress) {
                pendingApplications[i] = pendingApplications[pendingApplications.length - 1];
                pendingApplications.pop();
                break;
            }
        }
    }

    // Admin Management
    function addAdmin(address account) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, account);
    }

    function removeAdmin(address account) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, account);
    }
}