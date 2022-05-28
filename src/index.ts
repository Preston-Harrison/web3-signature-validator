import { ethers } from 'ethers';

/**
 * @returns a 32 byte nonce
 */
export const getRandomNonce = () => ethers.utils.randomBytes(32);

/**
 * 
 * @param types - the types of the values that will be packed. These must be solidity types.
 * @example ["uint256", "address"]
 * @param values - array of values to pack
 * @param signer - the signer that will sign the parameters
 * @param nonce - a 32 byte number to prevent signature from being reused. If not provided, no nonce will be used
 * @returns  the signature of the message
 */
export const signParams = async (
    types: readonly string[],
    values: readonly any[],
    signer: ethers.Signer,
    nonce?: Uint8Array
) => {
    if (nonce && ethers.utils.hexDataLength(nonce) !== 32) {
        throw new Error('Nonce must be exactly 32 bytes');
    }

    let message = ethers.utils.solidityPack(types, values);
    if (nonce) {
        message = ethers.utils.solidityPack(['bytes', 'bytes32'], [message, nonce]);
    }
    const bytes = ethers.utils.arrayify(ethers.utils.keccak256(message));
    const signature = await signer.signMessage(bytes);

    return ethers.utils.arrayify(signature);
}