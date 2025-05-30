// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VisaSBT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    uint256 public mintingFee;
    address public userRegistryAddress;

    mapping(uint256 => bool) public isVisaActive;
    mapping(address => uint256) public userToVisaTokenId; // Track user's visa token ID

    event VisaMinted(address indexed user, uint256 indexed tokenId, string tokenURI);
    event VisaStatusChanged(uint256 indexed tokenId, bool isActive);
    event FeeUpdated(uint256 newFee);

    modifier onlyAuthorized() {
        require(msg.sender == owner() || msg.sender == userRegistryAddress, "VisaSBT: Caller not authorized");
        _;
    }

    constructor(address initialOwner, uint256 _initialFee, address _userRegistryAddress)
        ERC721("OpenShelter VISA SBT", "OSVISASBT")
        Ownable(initialOwner)
    {
        mintingFee = _initialFee;
        userRegistryAddress = _userRegistryAddress;
    }

    // Make it Soul-Bound
    function _update(address to, uint256 tokenId, address auth)
        internal
        virtual
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "VisaSBT: Soul-bound token, non-transferable");
        return super._update(to, tokenId, auth);
    }

    function mintVisa(address to, string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= mintingFee, "VisaSBT: Insufficient fee paid");
        require(userToVisaTokenId[to] == 0, "VisaSBT: User already has a visa");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        isVisaActive[tokenId] = true;
        userToVisaTokenId[to] = tokenId;

        emit VisaMinted(to, tokenId, tokenURI);
        return tokenId;
    }
    
    function setVisaStatus(uint256 tokenId, bool active) public onlyAuthorized {
        require(tokenId < _nextTokenId, "VisaSBT: Token does not exist");
        isVisaActive[tokenId] = active;
        emit VisaStatusChanged(tokenId, active);
    }

    function setMintingFee(uint256 _newFee) public onlyOwner {
        mintingFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function withdrawFees() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    function setUserRegistryAddress(address _newUserRegistryAddress) public onlyOwner {
        userRegistryAddress = _newUserRegistryAddress;
    }

    function getUserVisaTokenId(address user) public view returns (uint256) {
        return userToVisaTokenId[user];
    }

    // Required overrides
    // function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
    //     address owner = ownerOf(tokenId);
    //     userToVisaTokenId[owner] = 0; // Clear the mapping
    //     super._burn(tokenId);
    // }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}