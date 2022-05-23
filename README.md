# sol-sig-validator
A library for validating on chain data passed in as parameters.

Sometimes you need off chain data to be used in your smart contracts. This library allows users to submit the relevant data to your smart contract with the safety that any data they submit will have had to been validated by a authorized signer.

## Contract example
```
contract NeedsAValidator {
    constructor() {
        _setValidator(msg.sender, true);
    }

    function tryToValidate(
        uint256 _data1, 
        address _data2, 
        bytes32 _nonce, 
        bytes memory signature
    ) public {
        validateSignature(abi.encodePacked(_uint), _nonce, signature);
        // now _data1 and _data2 can be used safely, knowing that it has been signed by a validator
    }
}
```

## Off chain example
```
import signParams from 'sol-sig-validator';

async function main() {
    // signer should be set to a validator on your contract
    const { nonce, signature } = await signParams(
        ["uint256", "address"], [1234, someAddress], signer
    );

    await NeedsAValidator.tryToValidate(
        1234,
        someAddress,
        nonce,
        signature
    );
}
```