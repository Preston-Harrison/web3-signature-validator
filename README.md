# web3-signature-validator
A library for validating on chain data passed in as parameters.

Sometimes you need off chain data to be used in your smart contracts. This library allows users to submit the relevant data to your smart contract with the safety that any data they submit will have had to been validated by a authorized signer.

## Installation
Install the package with either of the following:
```
$ npm install web3-signature-validator
$ yarn add web3-signature-validator
```

The Validator contract exposes two methods: `validateSignature` and `validateSignatureWithNonce`.
They do similar things, except `validateSignatureWithNonce` accepts a nonce parameter and will only validate a signature if the nonce has not been seen before.

## Contract Example
```solidity
import "web3-signature-validator/contracts/Validator.sol";

contract NeedsAValidator is Validator {
    constructor() {
        _setValidator(msg.sender, true);
    }

    function tryToValidate(
        uint256 _data1, 
        address _data2, 
        bytes32 _nonce, 
        bytes memory signature
    ) public {
        validateSignatureWithNonce(abi.encodePacked(_data1, _data2), _nonce, signature);
        // now _data1 and _data2 can be used safely, knowing that it has been signed by a validator
    }
}
```

## Off Chain Example
```javascript
import { signParams, getRandomNonce } from 'web3-signature-validator';

async function main() {
    const nonce = getRandomNonce();
    // signer should be set to a validator on your contract
    const signature = await signParams(
        ["uint256", "address"], [1234, someAddress], signer, nonce
    );

    await NeedsAValidator.tryToValidate(
        1234,
        someAddress,
        nonce,
        signature
    );
}
```
## Pitfalls
- When calling validateSignature or validateSignatureWithNonce, make sure all parameters (except the nonce) are encoded packed in the order they were signed on the server.
- Do not allow the user to pass in the pre-encoded data. E.g. in the previous example, note that _data1 and _data2 were 'encodePacked' in the contract. It is a security vulnerability to allow the user to pass in the pre-encoded value.
- The Validator contract exposes an internal method _isSignedByValidator. This method returns a boolean, and DOES NOT REVERT if the signed data is invalid. Best to avoid using this method if you can in favor of validateSignature or validateSignatureWithNonce.

**If you find any problems with this package, please open an issue!**  
This package is in beta until version 1.0.0
