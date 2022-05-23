import { ethers } from 'ethers';

/**
 * 
 * @param types - the types of the values that will be packed. These must be solidity types.
 * @example ["uint256", "address"]
 * @param values - array of values to pack
 * @param signer - the signer that will sign the parameters
 * @param nonce - a 32 byte number to prevent signature from being reused
 * @returns an object with the following properties:
 * - signature - the signature of the message
 * - nonce - the nonce used when signing the message
 */
const signParams = async (
    types: readonly string[],
    values: readonly any[],
    signer: ethers.Signer,
    nonce = ethers.utils.randomBytes(32)
) => {
    if (ethers.utils.hexDataLength(nonce) !== 32) {
        throw new Error('Nonce must be exactly 32 bytes');
    }

    const message = ethers.utils.solidityPack(types, values);
    const nonceMessage = ethers.utils.solidityPack(['bytes', 'bytes32'], [message, nonce]);
    const bytes = ethers.utils.arrayify(ethers.utils.keccak256(nonceMessage));
    const signature = await signer.signMessage(bytes);

    return {
        signature: ethers.utils.arrayify(signature),
        nonce,
    }
}

export default signParams;