// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@iden3/contracts/interfaces/IVerifier.sol";

/**
 * @title PayRouteTieredLimits
 * @notice Identity-based tiered transaction limits with ZK verification
 *
 * Tier 0: No verification   — $100/day limit
 * Tier 1: Liveness verified  — $1,000/day limit
 * Tier 2: Age + Country      — $10,000/day limit
 * Tier 3: Full verification  — Unlimited
 */
contract PayRouteTieredLimits is Ownable {
    IVerifier public universalVerifier;

    uint256 public humanityRequestId;
    uint256 public ageRequestId;
    uint256 public countryRequestId;

    uint256 public constant TIER_0_LIMIT = 100 * 1e6;
    uint256 public constant TIER_1_LIMIT = 1000 * 1e6;
    uint256 public constant TIER_2_LIMIT = 10000 * 1e6;
    uint256 public constant TIER_3_LIMIT = type(uint256).max;

    struct DailyUsage {
        uint256 amount;
        uint256 lastResetTime;
    }
    mapping(address => DailyUsage) public dailyUsage;
    mapping(uint256 => bool) public sanctionedCountries;
    mapping(address => uint8) public manualTierOverrides;
    mapping(address => bool) public hasManualOverride;

    event VerifierUpdated(address indexed newVerifier);
    event RequestIdsUpdated(uint256 humanity, uint256 age, uint256 country);
    event TierCalculated(address indexed user, uint8 tier, uint256 limit);
    event DailyLimitUsed(address indexed user, uint256 amount, uint256 remaining);
    event CountrySanctioned(uint256 indexed countryCode, bool sanctioned);
    event ManualTierSet(address indexed user, uint8 tier);

    constructor(
        address _verifier,
        uint256 _humanityRequestId,
        uint256 _ageRequestId,
        uint256 _countryRequestId
    ) Ownable(msg.sender) {
        universalVerifier = IVerifier(_verifier);
        humanityRequestId = _humanityRequestId;
        ageRequestId = _ageRequestId;
        countryRequestId = _countryRequestId;
    }

    function setVerifier(address _verifier) external onlyOwner {
        universalVerifier = IVerifier(_verifier);
        emit VerifierUpdated(_verifier);
    }

    function setRequestIds(uint256 _humanityRequestId, uint256 _ageRequestId, uint256 _countryRequestId) external onlyOwner {
        humanityRequestId = _humanityRequestId;
        ageRequestId = _ageRequestId;
        countryRequestId = _countryRequestId;
        emit RequestIdsUpdated(_humanityRequestId, _ageRequestId, _countryRequestId);
    }

    function setSanctionedCountry(uint256 countryCode, bool sanctioned) external onlyOwner {
        sanctionedCountries[countryCode] = sanctioned;
        emit CountrySanctioned(countryCode, sanctioned);
    }

    function setManualTier(address user, uint8 tier) external onlyOwner {
        require(tier <= 3, "Invalid tier");
        manualTierOverrides[user] = tier;
        hasManualOverride[user] = true;
        emit ManualTierSet(user, tier);
    }

    function removeManualTier(address user) external onlyOwner {
        hasManualOverride[user] = false;
    }

    function isHuman(address user) public view returns (bool) {
        if (address(universalVerifier) == address(0)) return false;
        return universalVerifier.isRequestProofVerified(user, humanityRequestId);
    }

    function isAdult(address user) public view returns (bool) {
        if (address(universalVerifier) == address(0)) return false;
        return universalVerifier.isRequestProofVerified(user, ageRequestId);
    }

    function hasCountryProof(address user) public view returns (bool) {
        if (address(universalVerifier) == address(0)) return false;
        return universalVerifier.isRequestProofVerified(user, countryRequestId);
    }

    function getUserTier(address user) public view returns (uint8) {
        if (hasManualOverride[user]) return manualTierOverrides[user];
        if (address(universalVerifier) == address(0)) return 0;

        bool human = isHuman(user);
        bool adult = isAdult(user);
        bool country = hasCountryProof(user);

        if (human && adult && country) return 3;
        if (adult && country) return 2;
        if (human) return 1;
        return 0;
    }

    function getDailyLimit(address user) public view returns (uint256) {
        uint8 tier = getUserTier(user);
        if (tier == 3) return TIER_3_LIMIT;
        if (tier == 2) return TIER_2_LIMIT;
        if (tier == 1) return TIER_1_LIMIT;
        return TIER_0_LIMIT;
    }

    function getRemainingDailyLimit(address user) public view returns (uint256) {
        uint256 limit = getDailyLimit(user);
        if (limit == type(uint256).max) return type(uint256).max;
        DailyUsage storage usage = dailyUsage[user];
        if (block.timestamp >= usage.lastResetTime + 1 days) return limit;
        if (usage.amount >= limit) return 0;
        return limit - usage.amount;
    }

    function checkLimit(address user, uint256 amount) external view returns (bool) {
        return getRemainingDailyLimit(user) >= amount;
    }

    function recordUsage(address user, uint256 amount) external {
        uint256 limit = getDailyLimit(user);
        DailyUsage storage usage = dailyUsage[user];
        if (block.timestamp >= usage.lastResetTime + 1 days) {
            usage.amount = 0;
            usage.lastResetTime = block.timestamp;
        }
        if (limit != type(uint256).max) {
            require(usage.amount + amount <= limit, "Daily limit exceeded");
        }
        usage.amount += amount;
        uint256 remaining = limit == type(uint256).max ? type(uint256).max : limit - usage.amount;
        emit DailyLimitUsed(user, amount, remaining);
    }

    function getIdentityStatus(address user) external view returns (
        uint8 tier, uint256 dailyLimit, uint256 dailyUsed, uint256 dailyRemaining,
        bool humanVerified, bool ageVerified, bool countryVerified, bool hasOverride
    ) {
        tier = getUserTier(user);
        dailyLimit = getDailyLimit(user);
        DailyUsage storage usage = dailyUsage[user];
        dailyUsed = block.timestamp >= usage.lastResetTime + 1 days ? 0 : usage.amount;
        dailyRemaining = getRemainingDailyLimit(user);
        humanVerified = isHuman(user);
        ageVerified = isAdult(user);
        countryVerified = hasCountryProof(user);
        hasOverride = hasManualOverride[user];
    }

    function getTierRequirements() external pure returns (string memory, string memory, string memory, string memory) {
        return (
            "No verification required - $100/day limit",
            "Liveness proof (human) - $1,000/day limit",
            "Age + Country verified - $10,000/day limit",
            "Full verification - Unlimited transactions"
        );
    }

    function getMissingVerifications(address user) external view returns (bool needsHumanity, bool needsAge, bool needsCountry) {
        if (getUserTier(user) >= 3) return (false, false, false);
        needsHumanity = !isHuman(user);
        needsAge = !isAdult(user);
        needsCountry = !hasCountryProof(user);
    }
}
