//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Validator.sol";

contract ValidatorTest is Validator {
    constructor() {
        _setValidator(msg.sender, true);
    }

    function tryToValidate(uint256 _uint, address _address, bytes32 _nonce, bytes memory signature) public returns (bool) {
        validateSignatureWithNonce(abi.encodePacked(_uint, _address), _nonce, signature);
        // now _uint and _address can be used safely, knowing that it has been validated
        return true;
    }

    function isSignedByValidator(bytes32 _messageHash, bytes memory _signature) public view returns (bool) {
        return _isSignedByValidator(_messageHash, _signature);
    }
}
