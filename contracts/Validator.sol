// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Validator {
    bytes public constant ECDSA_PREFIX_MESSAGE = "\x19Ethereum Signed Message:\n32";

    mapping(bytes32 => bool) private isNonceUsed;
    mapping(address => bool) private isValidator;

    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);

    function _setValidator(address validator, bool _isValidator) internal {
        if (_isValidator) {
            isValidator[validator] = true;
            emit ValidatorAdded(validator);
        } else {
            isValidator[validator] = false;
            emit ValidatorRemoved(validator);
        }
    }

    function _isSignedByValidator(bytes memory _message, bytes memory _signature) private view returns (bool)
    {
        bytes32 _hash = keccak256(abi.encodePacked(ECDSA_PREFIX_MESSAGE, _message));
        return isValidator[ECDSA.recover(_hash, _signature)];
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
    ) public {
        // signature is not valid if nonce has been used before
        require(!isNonceUsed[_nonce], "Validator: Nonce already used");
        isNonceUsed[_nonce] = true;
        
        bytes memory nonceMessage  = abi.encodePacked(_message, _nonce);
        require(_isSignedByValidator(nonceMessage, _signature), "Validator: Invalid signature");
    }
}
