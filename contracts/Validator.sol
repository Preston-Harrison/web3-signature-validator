// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Validator {
    mapping(bytes32 => bool) private _isNonceUsed;
    mapping(address => bool) private _isValidator;

    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);

    function _setValidator(address validator, bool newValidatorValue) internal {
        if (newValidatorValue) {
            _isValidator[validator] = true;
            emit ValidatorAdded(validator);
        } else {
            _isValidator[validator] = false;
            emit ValidatorRemoved(validator);
        }
    }

    function isValidator(address validator) public view returns (bool) {
        return _isValidator[validator];
    }

    function _isSignedByValidator(bytes32 _messageHash, bytes memory _signature) internal view returns (bool)
    {
        bytes32 _hash = ECDSA.toEthSignedMessageHash(_messageHash);
        return _isValidator[ECDSA.recover(_hash, _signature)];
    }

    /** 
     * @param _message - a message created by a list of arguments encoded with abi.encodePacked
     * @param _nonce - a nonce for this verification
     * @param _signature - a signature (should be passed in by external source)
     */
    function validateSignature(
        bytes memory _message,
        bytes32 _nonce,
        bytes memory _signature
    ) public returns (bool) {
        // signature is not valid if nonce has been used before
        require(!_isNonceUsed[_nonce], "Validator: Nonce already used");
        _isNonceUsed[_nonce] = true;
        
        bytes memory nonceMessage = abi.encodePacked(_message, _nonce);
        bytes32 messageHash = keccak256(nonceMessage);

        require(_isSignedByValidator(messageHash, _signature), "Validator: Invalid signature");
        return true;
    }
}
