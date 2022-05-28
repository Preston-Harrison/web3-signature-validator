import { expect } from "chai";
import { ethers } from "hardhat";
import { ValidatorTest } from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { signParams, getRandomNonce } from '../src';

const SAMPLE_ADDRESS = "0xF1dF824419879Bb8a7E758173523F88EfB7Af193";
const SAMPLE_UINT = 1208394723;

describe("Validator", () => {
  let ValidatorTest: ValidatorTest;
  let validator: SignerWithAddress;
  let account1: SignerWithAddress;

  before(async () => {
    [validator, account1] = await ethers.getSigners();
    let validatorTestDeploy = await ethers.getContractFactory("ValidatorTest", validator);
    ValidatorTest = await validatorTestDeploy.deploy();
  })

  describe("signParams", () => {
    it("should work with a nonce", async () => {
      const nonce = getRandomNonce();
      const signature = await signParams(
        ["uint256", "address"],
        [SAMPLE_UINT, SAMPLE_ADDRESS],
        validator,
        nonce
      );
      await ValidatorTest.tryToValidate(SAMPLE_UINT, SAMPLE_ADDRESS, nonce, signature);
      // if the above does not throw, validation was successful
    });
    it("should work without a nonce", async () => {
      const signature = await signParams(
        ["uint256", "address"],
        [SAMPLE_UINT, SAMPLE_ADDRESS],
        validator,
      );
      const message = ethers.utils.solidityPack(["uint256", "address"], [SAMPLE_UINT, SAMPLE_ADDRESS]);
      const messageHash = ethers.utils.keccak256(message);
      expect(await ValidatorTest.isSignedByValidator(messageHash, signature)).to.be.true;
    });
  })
});
