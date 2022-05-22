//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Validator.sol";

contract ValidatorTest is Validator {
    constructor() {
        _setValidator(msg.sender, true);
    }

    function tryToValidate(uint _uint, address _address, bytes32 _nonce, bytes memory signature) public returns (bool) {
        validateSignature(abi.encodePacked(_uint, _address), _nonce, signature);
        // now _uint and _address can be used safely, knowing that it has been validated
        return true;
    }
}
