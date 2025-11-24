const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConfidentialAuction", function () {
  let auction;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ConfidentialAuction = await ethers.getContractFactory("ConfidentialAuction");
    auction = await ConfidentialAuction.deploy();
    await auction.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await auction.owner()).to.equal(owner.address);
    });

    it("Should initialize auction counter to 0", async function () {
      expect(await auction.auctionCounter()).to.equal(0);
    });

    it("Should not be paused initially", async function () {
      expect(await auction.paused()).to.equal(false);
    });

    it("Should have zero platform fees initially", async function () {
      expect(await auction.platformFees()).to.equal(0);
    });
  });

  describe("Auction Creation", function () {
    it("Should create an auction successfully", async function () {
      const description = "Test Item";
      const reservePrice = ethers.parseEther("0.01");
      const duration = 3600; // 1 hour

      const tx = await auction.createAuction(description, reservePrice, duration);
      const receipt = await tx.wait();

      expect(await auction.auctionCounter()).to.equal(1);
    });

    it("Should fail with empty description", async function () {
      const reservePrice = ethers.parseEther("0.01");
      const duration = 3600;

      await expect(
        auction.createAuction("", reservePrice, duration)
      ).to.be.revertedWith("Empty description");
    });

    it("Should fail with description too long", async function () {
      const longDescription = "a".repeat(501);
      const reservePrice = ethers.parseEther("0.01");
      const duration = 3600;

      await expect(
        auction.createAuction(longDescription, reservePrice, duration)
      ).to.be.revertedWith("Description too long");
    });

    it("Should fail with reserve price too low", async function () {
      const description = "Test Item";
      const reservePrice = ethers.parseEther("0.0001");
      const duration = 3600;

      await expect(
        auction.createAuction(description, reservePrice, duration)
      ).to.be.revertedWith("Reserve too low");
    });

    it("Should fail with duration too short", async function () {
      const description = "Test Item";
      const reservePrice = ethers.parseEther("0.01");
      const duration = 60; // 1 minute

      await expect(
        auction.createAuction(description, reservePrice, duration)
      ).to.be.revertedWith("Invalid duration");
    });

    it("Should fail with duration too long", async function () {
      const description = "Test Item";
      const reservePrice = ethers.parseEther("0.01");
      const duration = 31 * 24 * 3600; // 31 days

      await expect(
        auction.createAuction(description, reservePrice, duration)
      ).to.be.revertedWith("Invalid duration");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause", async function () {
      await auction.setPaused(true);
      expect(await auction.paused()).to.equal(true);
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(
        auction.connect(addr1).setPaused(true)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow two-step ownership transfer", async function () {
      // Step 1: Transfer ownership
      await auction.transferOwnership(addr1.address);
      expect(await auction.pendingOwner()).to.equal(addr1.address);
      expect(await auction.owner()).to.equal(owner.address);

      // Step 2: Accept ownership
      await auction.connect(addr1).acceptOwnership();
      expect(await auction.owner()).to.equal(addr1.address);
      expect(await auction.pendingOwner()).to.equal(ethers.ZeroAddress);
    });

    it("Should prevent non-pending-owner from accepting ownership", async function () {
      await auction.transferOwnership(addr1.address);
      
      await expect(
        auction.connect(addr2).acceptOwnership()
      ).to.be.revertedWith("Not pending owner");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const description = "Test Item";
      const reservePrice = ethers.parseEther("0.01");
      const duration = 3600;
      
      await auction.createAuction(description, reservePrice, duration);
    });

    it("Should return auction details", async function () {
      const auctionData = await auction.getAuction(0);
      
      expect(auctionData.creator).to.equal(owner.address);
      expect(auctionData.itemDescription).to.equal("Test Item");
      expect(auctionData.reservePrice).to.equal(ethers.parseEther("0.01"));
    });

    it("Should return reveal status", async function () {
      const revealStatus = await auction.getRevealStatus(0);
      
      expect(revealStatus.decryptionStatus).to.equal(0); // None
    });

    it("Should return bidder count", async function () {
      expect(await auction.getBidderCount(0)).to.equal(0);
    });
  });

  describe("Contract State", function () {
    it("Should prevent actions when paused", async function () {
      await auction.setPaused(true);

      const description = "Test Item";
      const reservePrice = ethers.parseEther("0.01");
      const duration = 3600;

      await expect(
        auction.createAuction(description, reservePrice, duration)
      ).to.be.revertedWith("Contract paused");
    });
  });
});
