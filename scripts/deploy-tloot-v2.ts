import { network } from "hardhat";
import { formatEther } from "viem";

/**
 * Deploy Complete System: PlatformTokenV2 + Factories with MINTER_ROLE
 * This deploys everything needed for the pool system to work
 */

async function main() {
  console.log("🚀 Deploying Complete Pool System with TLOOT V2 to Mantle Sepolia...\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log("Deploying with account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("Account balance:", formatEther(balance), "MNT\n");

  // Existing contracts
  const MOCK_USDT = "0x59a2fB83F0f92480702EDEE8f84c72a1eF44BD9b";
  const SUPRA_ROUTER = "0x214F9eD5750D2fC87ae084184e999Ff7DFa1EB09";
  const adminAddress = deployer.account.address;

  console.log("Using existing contracts:");
  console.log("- MockUSDT:", MOCK_USDT);
  console.log("- Supra Router:", SUPRA_ROUTER);
  console.log("- Admin:", adminAddress);
  console.log("");

  // Step 1: Deploy PlatformTokenV2 (TLOOT)
  console.log("=" .repeat(60));
  console.log("STEP 1: Deploy PlatformTokenV2 (TLOOT)");
  console.log("=" .repeat(60));
  console.log("");
  console.log("📦 Deploying PlatformTokenV2...");
  const tloot = await viem.deployContract("PlatformTokenV2", []);
  console.log("✅ PlatformTokenV2 deployed to:", tloot.address);
  console.log("");

  // Step 2: Deploy Factories
  console.log("=" .repeat(60));
  console.log("STEP 2: Deploy Factory Contracts");
  console.log("=" .repeat(60));
  console.log("");
  
  console.log("📦 Deploying LuckyDrawFactory...");
  const ldFactory = await viem.deployContract("LuckyDrawFactory", [
    MOCK_USDT,
    tloot.address,
    SUPRA_ROUTER,
    adminAddress,
  ]);
  console.log("✅ LuckyDrawFactory deployed to:", ldFactory.address);
  console.log("");

  console.log("📦 Deploying CommitToClaimFactory...");
  const ctcFactory = await viem.deployContract("CommitToClaimFactory", [
    MOCK_USDT,
    tloot.address,
    adminAddress,
  ]);
  console.log("✅ CommitToClaimFactory deployed to:", ctcFactory.address);
  console.log("");

  // Step 3: Grant MINTER_ROLE to factories
  console.log("=" .repeat(60));
  console.log("STEP 3: Grant MINTER_ROLE and ADMIN_ROLE to Factories");
  console.log("=" .repeat(60));
  console.log("");

  console.log("🔑 Granting MINTER_ROLE to LuckyDrawFactory...");
  const hash1 = await deployer.writeContract({
    address: tloot.address,
    abi: tloot.abi,
    functionName: 'addMinter',
    args: [ldFactory.address],
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1 });
  console.log("✅ Granted MINTER_ROLE to LuckyDrawFactory");
  console.log("");

  console.log("🔑 Granting ADMIN_ROLE to LuckyDrawFactory (to add pool minters)...");
  const ADMIN_ROLE = await publicClient.readContract({
    address: tloot.address,
    abi: tloot.abi,
    functionName: 'ADMIN_ROLE',
  });
  const hash1b = await deployer.writeContract({
    address: tloot.address,
    abi: tloot.abi,
    functionName: 'grantRole',
    args: [ADMIN_ROLE, ldFactory.address],
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1b });
  console.log("✅ Granted ADMIN_ROLE to LuckyDrawFactory");
  console.log("");

  console.log("🔑 Granting MINTER_ROLE to CommitToClaimFactory...");
  const hash2 = await deployer.writeContract({
    address: tloot.address,
    abi: tloot.abi,
    functionName: 'addMinter',
    args: [ctcFactory.address],
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash2 });
  console.log("✅ Granted MINTER_ROLE to CommitToClaimFactory");
  console.log("");

  console.log("🔑 Granting ADMIN_ROLE to CommitToClaimFactory (to add pool minters)...");
  const hash2b = await deployer.writeContract({
    address: tloot.address,
    abi: tloot.abi,
    functionName: 'grantRole',
    args: [ADMIN_ROLE, ctcFactory.address],
    account: deployer.account,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash2b });
  console.log("✅ Granted ADMIN_ROLE to CommitToClaimFactory");
  console.log("");

  // Step 4: Verify permissions
  console.log("=" .repeat(60));
  console.log("STEP 4: Verify Permissions");
  console.log("=" .repeat(60));
  console.log("");

  const isLDMinter = await publicClient.readContract({
    address: tloot.address,
    abi: tloot.abi,
    functionName: 'isMinter',
    args: [ldFactory.address],
  });

  const isCTCMinter = await publicClient.readContract({
    address: tloot.address,
    abi: tloot.abi,
    functionName: 'isMinter',
    args: [ctcFactory.address],
  });

  console.log("LuckyDrawFactory can mint:", isLDMinter ? "✅ YES" : "❌ NO");
  console.log("CommitToClaimFactory can mint:", isCTCMinter ? "✅ YES" : "❌ NO");
  console.log("");

  // Summary
  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE");
  console.log("=" .repeat(60));
  console.log("");
  console.log("New Contracts:");
  console.log("- TLOOT Token (V2):        ", tloot.address);
  console.log("- LuckyDrawFactory:        ", ldFactory.address);
  console.log("- CommitToClaimFactory:    ", ctcFactory.address);
  console.log("");
  console.log("Existing Contracts:");
  console.log("- MockUSDT:                ", MOCK_USDT);
  console.log("- Supra Router:            ", SUPRA_ROUTER);
  console.log("");
  console.log("Permissions:");
  console.log("- LuckyDrawFactory:         MINTER_ROLE ✅");
  console.log("- CommitToClaimFactory:     MINTER_ROLE ✅");
  console.log("");
  console.log("✅ System is ready!");
  console.log("✅ Pools created by factories will have minting permissions");
  console.log("✅ Users will receive TLOOT immediately when joining pools");
  console.log("");
  console.log("⚠️  IMPORTANT: Update frontend constants:");
  console.log("   - TOKEN (TLOOT):", tloot.address);
  console.log("   - LUCKY_DRAW_FACTORY:", ldFactory.address);
  console.log("   - COMMIT_TO_CLAIM_FACTORY:", ctcFactory.address);
  console.log("");
  console.log("Next Steps:");
  console.log("1. Update src/lib/constants.ts with new addresses");
  console.log("2. Test pool creation at http://localhost:3000/pools/create");
  console.log("3. Test joining pools and receiving TLOOT rewards");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
