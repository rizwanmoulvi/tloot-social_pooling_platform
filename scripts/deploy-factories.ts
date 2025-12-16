import { network } from "hardhat";
import { formatEther } from "viem";

async function main() {
  console.log("🚀 Deploying new pool system contracts to Mantle Sepolia...\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log("Deploying with account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("Account balance:", formatEther(balance), "MNT\n");

  // Contract addresses (already deployed)
  const MOCK_USDT = "0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b";
  const TLOOT_TOKEN = "0x0470FF2ee65F43799fe4459840723a912137eE59";
  const SUPRA_ROUTER = "0x214F9eD5750D2fC87ae084184e999Ff7DFa1EB09"; // Mantle Sepolia
  
  const adminAddress = deployer.account.address;

  console.log("Using existing contracts:");
  console.log("- MockUSDT:", MOCK_USDT);
  console.log("- TLOOT Token:", TLOOT_TOKEN);
  console.log("- Supra Router:", SUPRA_ROUTER);
  console.log("- Admin:", adminAddress);
  console.log("");

  // 1. Deploy LuckyDrawFactory
  console.log("📦 Deploying LuckyDrawFactory...");
  const ldFactory = await viem.deployContract("LuckyDrawFactory", [
    MOCK_USDT,
    TLOOT_TOKEN,
    SUPRA_ROUTER,
    adminAddress,
  ]);
  console.log("✅ LuckyDrawFactory deployed to:", ldFactory.address);
  console.log("");

  // 2. Deploy CommitToClaimFactory
  console.log("📦 Deploying CommitToClaimFactory...");
  const ctcFactory = await viem.deployContract("CommitToClaimFactory", [
    MOCK_USDT,
    TLOOT_TOKEN,
    adminAddress
  ]);
  console.log("✅ CommitToClaimFactory deployed to:", ctcFactory.address);
  console.log("");

  // 3. Grant minting permissions to both factories
  console.log("🔑 Note: TLOOT token ownership needs to be transferred to factories");
  console.log("   This requires manual setup or a multi-sig approach in production");
  console.log("");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT SUMMARY");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Factories:");
  console.log("- LuckyDrawFactory:      ", ldFactory.address);
  console.log("- CommitToClaimFactory:  ", ctcFactory.address);
  console.log("");
  console.log("Existing Contracts:");
  console.log("- MockUSDT:              ", MOCK_USDT);
  console.log("- TLOOT Token:           ", TLOOT_TOKEN);
  console.log("- Supra Router:          ", SUPRA_ROUTER);
  console.log("");
  console.log("⚠️  IMPORTANT: Update frontend constants with new factory addresses");
  console.log("");
  console.log("Next Steps:");
  console.log("1. Update src/lib/constants.ts with factory addresses");
  console.log("2. Test pool creation through factories");
  console.log("3. Verify contracts on Mantle Explorer");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
