const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConfidentialLandPlatform - Basic Tests", function () {
  let contract;
  let owner;
  let alice;
  let bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const ConfidentialLandPlatform = await ethers.getContractFactory("ConfidentialLandPlatform");
    // Deploy with pauserAddresses array and kmsGeneration
    contract = await ConfidentialLandPlatform.deploy([owner.address], 1);
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      const address = await contract.getAddress();
      expect(address).to.be.properAddress;
    });

    it("should set the right city planning authority", async function () {
      expect(await contract.cityPlanningAuthority()).to.equal(owner.address);
    });

    it("should initialize with zero total zones", async function () {
      expect(await contract.getTotalZones()).to.equal(0n);
    });
  });

  describe("Access Control", function () {
    it("should allow pauser to pause", async function () {
      await contract.pause();
      expect(await contract.isPaused()).to.be.true;
    });

    it("should prevent non-pauser from pausing", async function () {
      await expect(
        contract.connect(alice).pause()
      ).to.be.reverted;
    });

    it("should allow authority to unpause", async function () {
      await contract.pause();
      await contract.unpause();
      expect(await contract.isPaused()).to.be.false;
    });
  });

  describe("View Functions", function () {
    it("should return correct total zones", async function () {
      const totalZones = await contract.getTotalZones();
      expect(totalZones).to.be.gte(0n);
    });

    it("should have correct city planning authority", async function () {
      const authority = await contract.cityPlanningAuthority();
      expect(authority).to.equal(owner.address);
    });
  });
});
