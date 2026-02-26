
export const VAULT_ABI = [
    "function deposit(uint256 assets, address receiver) external returns (uint256 shares)",
    "function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares)",
    "function totalAssets() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

export const IDENTITY_GATE_ABI = [
    "function isVerifiedHuman(address user) external view returns (bool)",
    "function setVerifiedHuman(address user, bool status) external"
];

export const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];
