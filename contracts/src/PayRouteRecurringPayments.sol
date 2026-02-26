// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PayRouteRecurringPayments
 * @notice Subscription and scheduled payment automation on Polygon
 * @dev Users create subscriptions that can be executed by anyone when due.
 *      Executors earn a small tip for triggering payments on time.
 */
contract PayRouteRecurringPayments is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Subscription {
        address subscriber;        // Who pays
        address recipient;         // Who receives
        address token;             // ERC20 token (USDC)
        uint256 amount;            // Amount per period
        uint256 interval;          // Seconds between payments (e.g., 30 days = 2592000)
        uint256 lastExecuted;      // Timestamp of last execution
        uint256 nextExecution;     // When the next payment is due
        uint256 executionsLeft;    // Remaining payments (0 = unlimited)
        uint256 totalExecuted;     // Total times executed
        uint256 executorTipBps;    // Tip for executor in basis points (e.g., 10 = 0.1%)
        bool isActive;             // Whether subscription is active
        string memo;               // Subscription memo/label
    }

    // Subscription ID counter
    uint256 public nextSubscriptionId;

    // Subscription storage
    mapping(uint256 => Subscription) public subscriptions;

    // User => subscription IDs
    mapping(address => uint256[]) public userSubscriptions;

    // Recipient => subscription IDs
    mapping(address => uint256[]) public recipientSubscriptions;

    // Supported tokens
    mapping(address => bool) public supportedTokens;

    // Protocol fee
    address public treasury;
    uint256 public protocolFeeBps; // e.g., 5 = 0.05%

    // Min/max intervals
    uint256 public constant MIN_INTERVAL = 1 hours;
    uint256 public constant MAX_INTERVAL = 365 days;

    // Events
    event SubscriptionCreated(
        uint256 indexed subscriptionId,
        address indexed subscriber,
        address indexed recipient,
        address token,
        uint256 amount,
        uint256 interval,
        uint256 executionsLeft,
        string memo
    );

    event SubscriptionExecuted(
        uint256 indexed subscriptionId,
        address indexed executor,
        uint256 amount,
        uint256 protocolFee,
        uint256 executorTip,
        uint256 nextExecution
    );

    event SubscriptionCancelled(uint256 indexed subscriptionId, address indexed subscriber);
    event SubscriptionPaused(uint256 indexed subscriptionId, address indexed subscriber);
    event SubscriptionResumed(uint256 indexed subscriptionId, address indexed subscriber);
    event SubscriptionUpdated(uint256 indexed subscriptionId, uint256 newAmount, uint256 newInterval);
    event TokenSupported(address indexed token, bool supported);

    constructor(address _treasury, uint256 _protocolFeeBps) Ownable(msg.sender) {
        treasury = _treasury;
        protocolFeeBps = _protocolFeeBps;
    }

    // ============ Admin ============

    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    function setProtocolFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 100, "Fee too high"); // Max 1%
        protocolFeeBps = _feeBps;
    }

    // ============ Subscriber Functions ============

    /**
     * @notice Create a new recurring payment subscription
     * @param recipient Address to pay
     * @param token ERC20 token address
     * @param amount Amount per payment
     * @param interval Seconds between payments
     * @param maxExecutions Maximum number of payments (0 = unlimited)
     * @param executorTipBps Tip for executor in basis points
     * @param startTime When to start (0 = now)
     * @param memo Payment label
     */
    function createSubscription(
        address recipient,
        address token,
        uint256 amount,
        uint256 interval,
        uint256 maxExecutions,
        uint256 executorTipBps,
        uint256 startTime,
        string calldata memo
    ) external returns (uint256 subscriptionId) {
        require(recipient != address(0), "Invalid recipient");
        require(recipient != msg.sender, "Cannot subscribe to self");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be > 0");
        require(interval >= MIN_INTERVAL && interval <= MAX_INTERVAL, "Invalid interval");
        require(executorTipBps <= 500, "Tip too high"); // Max 5%

        subscriptionId = nextSubscriptionId++;

        uint256 firstExecution = startTime > block.timestamp ? startTime : block.timestamp;

        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            recipient: recipient,
            token: token,
            amount: amount,
            interval: interval,
            lastExecuted: 0,
            nextExecution: firstExecution,
            executionsLeft: maxExecutions,
            totalExecuted: 0,
            executorTipBps: executorTipBps,
            isActive: true,
            memo: memo
        });

        userSubscriptions[msg.sender].push(subscriptionId);
        recipientSubscriptions[recipient].push(subscriptionId);

        emit SubscriptionCreated(subscriptionId, msg.sender, recipient, token, amount, interval, maxExecutions, memo);
    }

    /**
     * @notice Cancel a subscription permanently
     */
    function cancelSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Not subscriber");
        require(sub.isActive, "Already cancelled");

        sub.isActive = false;

        emit SubscriptionCancelled(subscriptionId, msg.sender);
    }

    /**
     * @notice Pause a subscription temporarily
     */
    function pauseSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Not subscriber");
        require(sub.isActive, "Not active");

        sub.isActive = false;
        emit SubscriptionPaused(subscriptionId, msg.sender);
    }

    /**
     * @notice Resume a paused subscription
     */
    function resumeSubscription(uint256 subscriptionId) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Not subscriber");
        require(!sub.isActive, "Already active");

        sub.isActive = true;
        // Reset next execution to now if it was in the past
        if (sub.nextExecution < block.timestamp) {
            sub.nextExecution = block.timestamp;
        }

        emit SubscriptionResumed(subscriptionId, msg.sender);
    }

    /**
     * @notice Update subscription amount or interval
     */
    function updateSubscription(uint256 subscriptionId, uint256 newAmount, uint256 newInterval) external {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.subscriber == msg.sender, "Not subscriber");
        require(sub.isActive, "Not active");
        require(newAmount > 0, "Amount must be > 0");
        require(newInterval >= MIN_INTERVAL && newInterval <= MAX_INTERVAL, "Invalid interval");

        sub.amount = newAmount;
        sub.interval = newInterval;

        emit SubscriptionUpdated(subscriptionId, newAmount, newInterval);
    }

    // ============ Execution (callable by anyone) ============

    /**
     * @notice Execute a due subscription payment
     * @dev Anyone can call this when a subscription is due. Executor earns a tip.
     * @param subscriptionId The subscription to execute
     */
    function executeSubscription(uint256 subscriptionId) external nonReentrant {
        Subscription storage sub = subscriptions[subscriptionId];
        require(sub.isActive, "Subscription not active");
        require(block.timestamp >= sub.nextExecution, "Not yet due");
        require(sub.executionsLeft == 0 || sub.executionsLeft > 0, "No executions left");

        if (sub.executionsLeft > 0) {
            sub.executionsLeft--;
            if (sub.executionsLeft == 0) {
                sub.isActive = false;
            }
        }

        uint256 amount = sub.amount;
        uint256 protocolFee = (amount * protocolFeeBps) / 10000;
        uint256 executorTip = (amount * sub.executorTipBps) / 10000;
        uint256 recipientAmount = amount - protocolFee - executorTip;

        // Transfer from subscriber
        IERC20(sub.token).safeTransferFrom(sub.subscriber, address(this), amount);

        // Pay protocol fee
        if (protocolFee > 0) {
            IERC20(sub.token).safeTransfer(treasury, protocolFee);
        }

        // Pay executor tip
        if (executorTip > 0 && msg.sender != sub.subscriber) {
            IERC20(sub.token).safeTransfer(msg.sender, executorTip);
        } else {
            recipientAmount += executorTip; // If subscriber self-executes, tip goes to recipient
        }

        // Pay recipient
        IERC20(sub.token).safeTransfer(sub.recipient, recipientAmount);

        // Update state
        sub.lastExecuted = block.timestamp;
        sub.nextExecution = block.timestamp + sub.interval;
        sub.totalExecuted++;

        emit SubscriptionExecuted(subscriptionId, msg.sender, amount, protocolFee, executorTip, sub.nextExecution);
    }

    /**
     * @notice Batch execute multiple subscriptions
     */
    function batchExecute(uint256[] calldata subscriptionIds) external {
        for (uint256 i = 0; i < subscriptionIds.length; i++) {
            try this.executeSubscription(subscriptionIds[i]) {} catch {}
        }
    }

    // ============ View Functions ============

    function getSubscription(uint256 subscriptionId) external view returns (Subscription memory) {
        return subscriptions[subscriptionId];
    }

    function getUserSubscriptionIds(address user) external view returns (uint256[] memory) {
        return userSubscriptions[user];
    }

    function getRecipientSubscriptionIds(address recipient) external view returns (uint256[] memory) {
        return recipientSubscriptions[recipient];
    }

    function isDue(uint256 subscriptionId) external view returns (bool) {
        Subscription storage sub = subscriptions[subscriptionId];
        return sub.isActive && block.timestamp >= sub.nextExecution;
    }

    /**
     * @notice Get all due subscriptions from a list (for keepers/executors)
     */
    function getDueSubscriptions(uint256[] calldata ids) external view returns (uint256[] memory dueIds) {
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            Subscription storage sub = subscriptions[ids[i]];
            if (sub.isActive && block.timestamp >= sub.nextExecution) count++;
        }

        dueIds = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            Subscription storage sub = subscriptions[ids[i]];
            if (sub.isActive && block.timestamp >= sub.nextExecution) {
                dueIds[idx++] = ids[i];
            }
        }
    }
}
