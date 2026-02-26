// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PayRouteRouter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public treasury;
    uint256 public feeBps;

    event PaymentSent(
        address indexed sender,
        address indexed recipient,
        address asset,
        uint256 amount,
        uint256 fee,
        string routeId
    );

    event TreasuryUpdated(address newTreasury);
    event FeeUpdated(uint256 newFeeBps);

    constructor(address _usdc, address _treasury, uint256 _feeBps) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        treasury = _treasury;
        feeBps = _feeBps;
    }

    function sendPayment(
        address recipient,
        uint256 amount,
        string calldata routeId
    ) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(recipient != address(0), "Invalid recipient");

        uint256 fee = (amount * feeBps) / 10000;
        uint256 amountAfterFee = amount - fee;

        usdc.safeTransferFrom(msg.sender, address(this), amount);

        if (fee > 0) {
            usdc.safeTransfer(treasury, fee);
        }

        usdc.safeTransfer(recipient, amountAfterFee);

        emit PaymentSent(msg.sender, recipient, address(usdc), amountAfterFee, fee, routeId);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 500, "Fee too high");
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }
}
