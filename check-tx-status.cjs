const hre = require("hardhat");

async function main() {
  const txHash = "0x55d818dd15a047b00fe37f23b448bf1eff2f480f445badda40c44e17ef450175";

  console.log("🔍 Checking transaction:", txHash);
  console.log("🔗 Etherscan:", `https://sepolia.etherscan.io/tx/${txHash}`);
  console.log("");

  try {
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);

    if (!receipt) {
      console.log("⏳ Transaction pending or not found...");
      return;
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 TRANSACTION RECEIPT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Status:", receipt.status === 1 ? "✅ Success" : "❌ Failed");
    console.log("Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("From:", receipt.from);
    console.log("To:", receipt.to);

    if (receipt.status === 0) {
      console.log("\n❌ TRANSACTION FAILED!");
      console.log("The transaction was confirmed but reverted during execution.");
    } else {
      console.log("\n🎉 TRANSACTION SUCCESSFUL!");

      // Check total zones
      const contractAddress = "0xba4FB3D706a6754FFbcF9B01Cc3176F003343d11";
      const Contract = await hre.ethers.getContractFactory("ConfidentialLandPlatform");
      const contract = Contract.attach(contractAddress);

      const totalZones = await contract.getTotalZones();
      console.log("\n📈 Total zones registered:", totalZones.toString());
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

main().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
});
