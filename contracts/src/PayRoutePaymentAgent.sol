// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title PayRoutePaymentAgent
 * @notice x402-style AI Payment Agent for delegated payments
 */
contract PayRoutePaymentAgent is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    struct AgentPolicy {
        address agent;
        uint256 maxAmountPerTx;
        uint256 maxDailyAmount;
        uint256 dailySpent;
        uint256 lastResetTime;
        address[] allowedRecipients;
        bool isActive;
        uint256 expiresAt;
    }

    mapping(address => bool) public supportedTokens;
    mapping(address => mapping(address => AgentPolicy)) public agentPolicies;
    mapping(address => address[]) public userAgents;
    mapping(address => uint256) public nonces;

    address public treasury;
    uint256 public feeBps;

    event AgentCreated(address indexed owner, address indexed agent, uint256 maxAmountPerTx, uint256 maxDailyAmount, uint256 expiresAt);
    event AgentPaymentExecuted(address indexed owner, address indexed agent, address indexed recipient, address token, uint256 amount, string memo);
    event AgentRevoked(address indexed owner, address indexed agent);
    event AgentPolicyUpdated(address indexed owner, address indexed agent);
    event TokenSupported(address indexed token, bool supported);

    constructor(address _treasury, uint256 _feeBps) Ownable(msg.sender) {
        treasury = _treasury;
        feeBps = _feeBps;
    }

    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 500, "Fee too high");
        feeBps = _feeBps;
    }

    function createAgent(
        address agent,
        uint256 maxAmountPerTx,
        uint256 maxDailyAmount,
        address[] calldata allowedRecipients,
        uint256 duration
    ) external {
        require(agent != address(0), "Invalid agent");
        require(agent != msg.sender, "Cannot be own agent");
        require(maxAmountPerTx > 0, "Max amount must be > 0");
        require(maxDailyAmount >= maxAmountPerTx, "Daily must >= per tx");

        AgentPolicy storage policy = agentPolicies[msg.sender][agent];
        if (!policy.isActive) {
            userAgents[msg.sender].push(agent);
        }

        policy.agent = agent;
        policy.maxAmountPerTx = maxAmountPerTx;
        policy.maxDailyAmount = maxDailyAmount;
        policy.allowedRecipients = allowedRecipients;
        policy.isActive = true;
        policy.expiresAt = duration > 0 ? block.timestamp + duration : 0;
        policy.dailySpent = 0;
        policy.lastResetTime = block.timestamp;

        emit AgentCreated(msg.sender, agent, maxAmountPerTx, maxDailyAmount, policy.expiresAt);
    }

    function revokeAgent(address agent) external {
        AgentPolicy storage policy = agentPolicies[msg.sender][agent];
        require(policy.isActive, "Agent not active");
        policy.isActive = false;
        emit AgentRevoked(msg.sender, agent);
    }

    function updateAllowedRecipients(address agent, address[] calldata newRecipients) external {
        AgentPolicy storage policy = agentPolicies[msg.sender][agent];
        require(policy.isActive, "Agent not active");
        policy.allowedRecipients = newRecipients;
        emit AgentPolicyUpdated(msg.sender, agent);
    }

    function executeAgentPayment(
        address owner,
        address recipient,
        address token,
        uint256 amount,
        string calldata memo
    ) external nonReentrant {
        AgentPolicy storage policy = agentPolicies[owner][msg.sender];
        require(policy.isActive, "Agent not active");
        require(policy.expiresAt == 0 || block.timestamp < policy.expiresAt, "Policy expired");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");
        require(amount <= policy.maxAmountPerTx, "Exceeds per-tx limit");

        if (block.timestamp >= policy.lastResetTime + 1 days) {
            policy.dailySpent = 0;
            policy.lastResetTime = block.timestamp;
        }
        require(policy.dailySpent + amount <= policy.maxDailyAmount, "Exceeds daily limit");

        if (policy.allowedRecipients.length > 0) {
            bool isAllowed = false;
            for (uint i = 0; i < policy.allowedRecipients.length; i++) {
                if (policy.allowedRecipients[i] == recipient) { isAllowed = true; break; }
            }
            require(isAllowed, "Recipient not whitelisted");
        }

        uint256 fee = (amount * feeBps) / 10000;
        uint256 amountAfterFee = amount - fee;
        policy.dailySpent += amount;

        IERC20(token).safeTransferFrom(owner, address(this), amount);
        if (fee > 0) { IERC20(token).safeTransfer(treasury, fee); }
        IERC20(token).safeTransfer(recipient, amountAfterFee);

        emit AgentPaymentExecuted(owner, msg.sender, recipient, token, amountAfterFee, memo);
    }

    function executeAgentPaymentWithSignature(
        address owner,
        address recipient,
        address token,
        uint256 amount,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        require(block.timestamp <= deadline, "Signature expired");
        bytes32 hash = keccak256(abi.encodePacked(owner, msg.sender, recipient, token, amount, nonces[owner], deadline));
        address signer = hash.toEthSignedMessageHash().recover(signature);
        require(signer == owner, "Invalid signature");
        nonces[owner]++;
        _executePayment(owner, msg.sender, recipient, token, amount);
    }

    function _executePayment(address owner, address agent, address recipient, address token, uint256 amount) internal {
        AgentPolicy storage policy = agentPolicies[owner][agent];
        require(policy.isActive, "Agent not active");
        require(policy.expiresAt == 0 || block.timestamp < policy.expiresAt, "Policy expired");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0 && amount <= policy.maxAmountPerTx, "Invalid amount");

        if (block.timestamp >= policy.lastResetTime + 1 days) {
            policy.dailySpent = 0;
            policy.lastResetTime = block.timestamp;
        }
        require(policy.dailySpent + amount <= policy.maxDailyAmount, "Exceeds daily limit");
        _checkRecipientAllowed(policy, recipient);

        uint256 fee = (amount * feeBps) / 10000;
        policy.dailySpent += amount;

        IERC20(token).safeTransferFrom(owner, address(this), amount);
        if (fee > 0) { IERC20(token).safeTransfer(treasury, fee); }
        IERC20(token).safeTransfer(recipient, amount - fee);

        emit AgentPaymentExecuted(owner, agent, recipient, token, amount - fee, "");
    }

    function _checkRecipientAllowed(AgentPolicy storage policy, address recipient) internal view {
        if (policy.allowedRecipients.length > 0) {
            bool isAllowed = false;
            for (uint i = 0; i < policy.allowedRecipients.length; i++) {
                if (policy.allowedRecipients[i] == recipient) { isAllowed = true; break; }
            }
            require(isAllowed, "Recipient not whitelisted");
        }
    }

    function getAgentPolicy(address owner, address agent) external view returns (
        address agentAddr, uint256 maxAmountPerTx, uint256 maxDailyAmount,
        uint256 dailySpent, uint256 remainingDaily, bool isActive,
        uint256 expiresAt, uint256 allowedRecipientsCount
    ) {
        AgentPolicy storage policy = agentPolicies[owner][agent];
        uint256 currentDailySpent = policy.dailySpent;
        if (block.timestamp >= policy.lastResetTime + 1 days) { currentDailySpent = 0; }
        return (policy.agent, policy.maxAmountPerTx, policy.maxDailyAmount, currentDailySpent,
            policy.maxDailyAmount - currentDailySpent, policy.isActive, policy.expiresAt, policy.allowedRecipients.length);
    }

    function getUserAgents(address user) external view returns (address[] memory) { return userAgents[user]; }
    function getAllowedRecipients(address owner, address agent) external view returns (address[] memory) { return agentPolicies[owner][agent].allowedRecipients; }

    function isAgentActive(address owner, address agent) external view returns (bool) {
        AgentPolicy storage policy = agentPolicies[owner][agent];
        if (!policy.isActive) return false;
        if (policy.expiresAt > 0 && block.timestamp >= policy.expiresAt) return false;
        return true;
    }
}
