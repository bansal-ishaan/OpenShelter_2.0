// Contract addresses from the OpenShelter_2.0 repository
export const CONTRACT_ADDRESSES = {
  VERIFICATION_SBT: "0xd9145CCE52D386f254917e481eB44e9943F39138",
  USER_REGISTRY: "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8",
  VISA_SBT: "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B",
  LOAN_CONTRACT: "0x7EF2e0048f5bAeDe046f6BF797943daF4ED8CB47",
  // Keep USDC for payments (this would be the actual USDC contract on your network)
  USDC_TOKEN: "0xA0b86a33E6441b8dB4B2b8b8b8b8b8b8b8b8b8b8", // Replace with actual USDC address
}

// Contract ABIs - Replace with actual ABIs from your repository
export const CONTRACT_ABIS = {
  VERIFICATION_SBT: [
    "function mint(address to, string memory tokenURI) external",
    "function verify(address holder) external view returns (bool)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
  ],

  USER_REGISTRY: [
    "function registerUser(string memory name, string memory email, string memory documentHash, string memory country) external",
    "function verifyUser(address user) external",
    "function isUserRegistered(address user) external view returns (bool)",
    "function isUserVerified(address user) external view returns (bool)",
    "function getUserInfo(address user) external view returns (string memory, string memory, string memory, bool)",
    "function getReputationScore(address user) external view returns (uint256)",
  ],

  VISA_SBT: [
    "function mint(address to, string memory tokenURI) external",
    "function hasValidVisa(address holder) external view returns (bool)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "function balanceOf(address owner) external view returns (uint256)",
  ],

  LOAN_CONTRACT: [
    "function applyForLoan(uint256 amount, uint256 termMonths, string memory purpose) external",
    "function approveLoan(uint256 loanId) external",
    "function disburseLoan(uint256 loanId) external",
    "function repayLoan(uint256 loanId, uint256 amount) external",
    "function getLoanDetails(uint256 loanId) external view returns (uint256, uint256, uint256, address, uint8, uint256)",
    "function getUserLoans(address user) external view returns (uint256[] memory)",
    "function calculateMonthlyPayment(uint256 amount, uint256 termMonths) external pure returns (uint256)",
  ],

  USDC_TOKEN: [
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
  ],
}

export const CHAIN_CONFIG = {
  chainId: 11155111, // Sepolia testnet
  chainName: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  blockExplorer: "https://sepolia.etherscan.io",
}
