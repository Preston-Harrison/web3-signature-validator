import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { ValidatorTest } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const SAMPLE_ADDRESS = "0xF1dF824419879Bb8a7E758173523F88EfB7Af193";
const SAMPLE_UINT = 1208394723;
const SAMPLE_NONCE = ethers.utils.formatBytes32String("sample bytes32 nonce");

describe("Validator", () => {
  let ValidatorTest: ValidatorTest;
  let validator: SignerWithAddress;
  let account1: SignerWithAddress;

  before(async () => {
    [validator, account1] = await ethers.getSigners();
    let validatorTestDeploy = await ethers.getContractFactory("ValidatorTest", validator);
    ValidatorTest = await validatorTestDeploy.deploy();
  })

  describe("_isSignerByValidator", () => {
    it("should correctly identify if a message was signed by a validator", async () => {
      expect(await ValidatorTest.isValidator(validator.address)).to.be.true;

      const message = ethers.utils.randomBytes(32);
      const signature = await validator.signMessage(ethers.utils.arrayify(message));

      expect(await ValidatorTest.isSignedByValidator(message, signature)).to.be.true;
    })

    it("should correctly identify if a message was signed by a non-validator", async () => {
      expect(await ValidatorTest.isValidator(account1.address)).to.be.false;

      const message = ethers.utils.randomBytes(32);
      const signature = await account1.signMessage(ethers.utils.arrayify(message));

      expect(await ValidatorTest.isSignedByValidator(message, signature)).to.be.false;
    });
  })

  describe("validateSignature", () => {
    it("should correctly validate a signature with a nonce", async () => {
      expect(await ValidatorTest.isValidator(validator.address)).to.be.true;
      const message = ethers.utils.randomBytes(32);
      const nonce = ethers.utils.randomBytes(32);
      const nonceMessage = ethers.utils.solidityPack(["bytes", "bytes32"], [message, nonce]);
      const nonceMessageBytes = ethers.utils.arrayify(ethers.utils.keccak256(nonceMessage));
      const signature = await validator.signMessage(nonceMessageBytes);
      await ValidatorTest.validateSignature(message, nonce, signature);
      // if the above does not throw, validation was successful
    })
    it("should correctly invalidate a signature with a nonce", async () => {
      expect(await ValidatorTest.isValidator(account1.address)).to.be.false;
      const message = ethers.utils.randomBytes(32);
      const nonce = ethers.utils.randomBytes(32);
      const nonceMessage = ethers.utils.solidityPack(["bytes", "bytes32"], [message, nonce]);
      const nonceMessageBytes = ethers.utils.arrayify(ethers.utils.keccak256(nonceMessage));
      const signature = await account1.signMessage(nonceMessageBytes);
      try {
        await ValidatorTest.validateSignature(message, nonce, signature);
        assert.fail("Validator should have thrown an error");
      } catch (e: any) {
        expect(e.message).to.include("Validator: Invalid signature");
      }
    })
    it("should fail if the same nonce is used twice", async () => {
      expect(await ValidatorTest.isValidator(validator.address)).to.be.true;
      const message = ethers.utils.randomBytes(32);
      const nonce = ethers.utils.randomBytes(32);
      const nonceMessage = ethers.utils.solidityPack(["bytes", "bytes32"], [message, nonce]);
      const nonceMessageBytes = ethers.utils.arrayify(ethers.utils.keccak256(nonceMessage));
      const signature = await validator.signMessage(nonceMessageBytes);
      await ValidatorTest.validateSignature(message, nonce, signature);
      try {
        await ValidatorTest.validateSignature(message, nonce, signature);
        assert.fail("Validator should have thrown an error");
      } catch (e: any) {
        expect(e.message).to.include("Validator: Nonce already used");
      }
    })
  })
});
