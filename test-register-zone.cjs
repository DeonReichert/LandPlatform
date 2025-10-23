/**
 * Test registerLandZone function
 * This script simulates the transaction to see why it fails
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🧪 Testing registerLandZone function...\n");

  const contractAddress = "0xba4FB3D706a6754FFbcF9B01Cc3176F003343d11";

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Signer address:", signer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");

  // Get contract instance
  const Contract = await hre.ethers.getContractFactory("ConfidentialLandPlatform");
  const contract = Contract.attach(contractAddress);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 CONTRACT STATE CHECK");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Check contract state
  const isPaused = await contract.isContractPaused();
  console.log("   Contract Paused:", isPaused ? "Yes ❌" : "No ✅");

  if (isPaused) {
    console.log("\n❌ CONTRACT IS PAUSED!");
    console.log("All transactions will fail. You need to unpause it first.");
    return;
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 TEST DATA");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const testData = {
    area: 5000,
    population: 1200,
    value: 850,
    zoningType: 1, // Residential
    description: "Test Zone from Hardhat Script"
  };

  console.log("   Area:", testData.area);
  console.log("   Population:", testData.population);
  console.log("   Value:", testData.value);
  console.log("   Zoning Type:", testData.zoningType);
  console.log("   Description:", testData.description);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 ATTEMPTING TRANSACTION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Estimate gas first
    console.log("\n⛽ Estimating gas...");
    const gasEstimate = await contract.registerLandZone.estimateGas(
      testData.area,
      testData.population,
      testData.value,
      testData.zoningType,
      testData.description
    );
    console.log("   Estimated gas:", gasEstimate.toString());

    // Check if estimate exceeds Sepolia's limit
    const sepoliaLimit = 16777216n;
    if (gasEstimate > sepoliaLimit) {
      console.log("   ⚠️  WARNING: Estimated gas exceeds Sepolia limit!");
      console.log("   Sepolia limit:", sepoliaLimit.toString());
    }

    // Try to send the transaction with explicit gas limit
    console.log("\n📤 Sending transaction with gas limit: 5,000,000");
    const tx = await contract.registerLandZone(
      testData.area,
      testData.population,
      testData.value,
      testData.zoningType,
      testData.description,
      {
        gasLimit: 5000000n
      }
    );

    console.log("\n✅ Transaction sent!");
    console.log("   Transaction hash:", tx.hash);

    console.log("\n⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    console.log("\n🎉 TRANSACTION SUCCESSFUL!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   Block number:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("   Status:", receipt.status === 1 ? "Success ✅" : "Failed ❌");

    // Check total zones
    const totalZones = await contract.getTotalZones();
    console.log("\n   Total zones now:", totalZones.toString());

  } catch (error) {
    console.log("\n❌ TRANSACTION FAILED!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("\nError message:", error.message);

    if (error.reason) {
      console.error("Reason:", error.reason);
    }

    if (error.code) {
      console.error("Error code:", error.code);
    }

    if (error.data) {
      console.error("Error data:", error.data);
    }

    // Try to decode the revert reason
    if (error.data && typeof error.data === 'string') {
      try {
        const reason = hre.ethers.toUtf8String('0x' + error.data.substring(138));
        console.error("\n🔍 Decoded revert reason:", reason);
      } catch (e) {
        console.error("\n⚠️  Could not decode revert reason");
      }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💡 POSSIBLE CAUSES:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   1. Contract is paused (check with npm run check-status)");
    console.log("   2. Invalid zoning type (must be 1-4)");
    console.log("   3. Gas limit too low or too high");
    console.log("   4. FHE library issue (TFHE.asEuint32 might fail)");
    console.log("   5. Network congestion or RPC issues");
    console.log("");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ SCRIPT FAILED");
    console.error(error);
    process.exit(1);
  });
