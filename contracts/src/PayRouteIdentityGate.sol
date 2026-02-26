// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@iden3/contracts/interfaces/IVerifier.sol";

contract PayRouteIdentityGate is Ownable {
    IVerifier public universalVerifier;
    uint256 public humanityRequestId;
    uint256 public ageRequestId;

    event IdentityVerified(address indexed user, bool status);
    event VerifierUpdated(address indexed newVerifier);
    event RequestIdsUpdated(uint256 humanity, uint256 age);

    constructor(address _verifier, uint256 _humanityRequestId, uint256 _ageRequestId) Ownable(msg.sender) {
        universalVerifier = IVerifier(_verifier);
        humanityRequestId = _humanityRequestId;
        ageRequestId = _ageRequestId;
    }

    function setVerifier(address _verifier) external onlyOwner {
        universalVerifier = IVerifier(_verifier);
        emit VerifierUpdated(_verifier);
    }

    function setRequestIds(uint256 _humanityRequestId, uint256 _ageRequestId) external onlyOwner {
        humanityRequestId = _humanityRequestId;
        ageRequestId = _ageRequestId;
        emit RequestIdsUpdated(_humanityRequestId, _ageRequestId);
    }

    function hasAccess(address user) public view returns (bool) {
        if (address(universalVerifier) == address(0)) return true;
        return universalVerifier.isRequestProofVerified(user, humanityRequestId);
    }

    function isHuman(address user) public view returns (bool) {
        if (address(universalVerifier) == address(0)) return false;
        return universalVerifier.isRequestProofVerified(user, humanityRequestId);
    }

    function isAdult(address user) public view returns (bool) {
        if (address(universalVerifier) == address(0)) return false;
        return universalVerifier.isRequestProofVerified(user, ageRequestId);
    }
}
