/**
 * Check Contract Status Script
 * Checks if the contract is paused and provides solutions
 */

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔍 Checking Contract Status...\n");

  const contractAddress = "0xba4FB3D706a6754FFbcF9B01Cc3176F003343d11";

  console.log("📍 Contract Address:", contractAddress);
  console.log("🌐 Network:", hre.network.name);
  console.log("🔗 Explorer: https://sepolia.etherscan.io/address/" + contractAddress);
  console.log("");

  try {
    // Get contract instance
    const Contract = await hre.ethers.getContractFactory("ConfidentialLandPlatform");
    const contract = Contract.attach(contractAddress);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 CONTRACT STATE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Check if contract is paused
    const isPaused = await contract.isContractPaused();
    console.log("   Contract Paused:", isPaused ? "Yes ⏸️  ❌" : "No ▶️  ✅");

    // Get authority
    const authority = await contract.cityPlanningAuthority();
    console.log("   Planning Authority:", authority);

    // Get totals
    const totalZones = await contract.getTotalZones();
    const totalProjects = await contract.getTotalProjects();
    console.log("   Total Zones:", totalZones.toString());
    console.log("   Total Projects:", totalProjects.toString());

    // Get current user
    const [signer] = await hre.ethers.getSigners();
    console.log("\n   Your Address:", signer.address);

    // Check if user is authority
    const isAuthority = signer.address.toLowerCase() === authority.toLowerCase();
    console.log("   You are Authority:", isAuthority ? "Yes ✓" : "No ✗");

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (isPaused) {
      console.log("❌ PROBLEM FOUND: Contract is PAUSED");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n🔴 All transactions will fail while the contract is paused!");
      console.log("");
      console.log("💡 SOLUTIONS:");
      console.log("");

      if (isAuthority) {
        console.log("✅ You are the authority! You can unpause the contract:");
        console.log("");
        console.log("   Run this command:");
        console.log("   npx hardhat run scripts/unpause-contract.cjs --network sepolia");
        console.log("");
      } else {
        console.log("⚠️  You are NOT the authority.");
        console.log("");
        console.log("   Authority Address: " + authority);
        console.log("   Your Address:      " + signer.address);
        console.log("");
        console.log("Options:");
        console.log("   1. Contact the authority to unpause the contract");
        console.log("   2. OR deploy a NEW contract that you control");
        console.log("      Run: npm run deploy");
        console.log("");
      }
    } else {
      console.log("✅ CONTRACT IS ACTIVE");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\nThe contract is not paused. Transactions should work!");
      console.log("");
      console.log("If transactions are still failing, check:");
      console.log("   1. Do you have enough Sepolia ETH?");
      console.log("   2. Is your gas limit correct? (should be 5,000,000)");
      console.log("   3. Are you connected to Sepolia testnet?");
      console.log("");
    }

  } catch (error) {
    console.error("\n❌ ERROR CHECKING CONTRACT");
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error(error.message);
    console.error("");
    console.error("This might mean:");
    console.error("   - Contract doesn't exist at this address");
    console.error("   - RPC connection issues");
    console.error("   - Wrong network configuration");
    console.error("");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ SCRIPT FAILED");
    console.error(error);
    process.exit(1);
  });
