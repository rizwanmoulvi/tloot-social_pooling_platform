import { network } from "hardhat";
import { formatEther, formatUnits, parseUnits } from "viem";

/**
 * Setup TLOOT Reserves for Factories
 * 
 * This script funds the factory contracts with TLOOT so they can
 * distribute to newly created pools (Aave-style pattern)
 */

async function main() {
  console.log("🏦 Setting up TLOOT reserves for factories...\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log("Deployer account:", deployer.account.address);
  const balance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("MNT balance:", formatEther(balance), "MNT\n");

  // Contract addresses
  const TLOOT_TOKEN = "0x0470FF2ee65F43799fe4459840723a912137eE59";
  const LUCKY_DRAW_FACTORY = "0xfa221231867f5e7ed623133bebc2e565f5486339";
  const COMMIT_TO_CLAIM_FACTORY = "0x3849e494ffa344b8aa3aa7e355d1f06aafd4be46";

  // TLOOT ABI for token operations
  const TLOOT_ABI = [
    {
      "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}, {"name": "reason", "type": "string"}],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "approve",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"name": "account", "type": "address"}],
      "name": "balanceOf",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{"name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  console.log("Contract Addresses:");
  console.log("- TLOOT Token:", TLOOT_TOKEN);
  console.log("- LuckyDrawFactory:", LUCKY_DRAW_FACTORY);
  console.log("- CommitToClaimFactory:", COMMIT_TO_CLAIM_FACTORY);
  console.log("");

  // Check TLOOT owner
  const tlootOwner = await publicClient.readContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'owner',
  });

  console.log("TLOOT Token Owner:", tlootOwner);
  console.log("Current Account:", deployer.account.address);
  console.log("Is Owner:", tlootOwner.toLowerCase() === deployer.account.address.toLowerCase() ? "✅ YES" : "❌ NO");
  console.log("");

  if (tlootOwner.toLowerCase() !== deployer.account.address.toLowerCase()) {
    console.log("❌ ERROR: Current account is not TLOOT owner!");
    console.log("   You need to use the owner account to mint TLOOT");
    console.log("");
    return;
  }

  // Check current TLOOT supply
  const totalSupply = await publicClient.readContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'totalSupply',
  });

  console.log("Current TLOOT Total Supply:", formatUnits(totalSupply as bigint, 18), "TLOOT");
  console.log("");

  // Calculate reserve amounts
  // For Lucky Draw: Assume avg pool needs 100 participants * $100 entry = 10,000 TLOOT per pool
  // Reserve for 100 pools = 1,000,000 TLOOT
  const luckyDrawReserve = parseUnits("1000000", 18); // 1M TLOOT
  
  // For Commit-to-Claim: Assume avg ticket $500 = 500 TLOOT per pool
  // Reserve for 1000 pools = 500,000 TLOOT
  const commitToClaimReserve = parseUnits("500000", 18); // 500K TLOOT

  console.log("📊 Reserve Calculation:");
  console.log("- LuckyDraw Reserve:       ", formatUnits(luckyDrawReserve, 18), "TLOOT");
  console.log("- CommitToClaim Reserve:   ", formatUnits(commitToClaimReserve, 18), "TLOOT");
  console.log("- Total Needed:            ", formatUnits(luckyDrawReserve + commitToClaimReserve, 18), "TLOOT");
  console.log("");

  // Step 1: Mint TLOOT to deployer if needed
  const deployerBalance = await publicClient.readContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'balanceOf',
    args: [deployer.account.address],
  });

  console.log("Current Deployer TLOOT Balance:", formatUnits(deployerBalance as bigint, 18), "TLOOT");

  const totalNeeded = luckyDrawReserve + commitToClaimReserve;
  if ((deployerBalance as bigint) < totalNeeded) {
    const amountToMint = totalNeeded - (deployerBalance as bigint);
    console.log("💰 Minting", formatUnits(amountToMint, 18), "TLOOT to deployer...");
    
    const mintHash = await deployer.writeContract({
      address: TLOOT_TOKEN as `0x${string}`,
      abi: TLOOT_ABI,
      functionName: 'mint',
      args: [deployer.account.address, amountToMint, "Factory reserves"],
      account: deployer.account,
    });

    await publicClient.waitForTransactionReceipt({ hash: mintHash });
    console.log("✅ Minted successfully");
    console.log("");
  } else {
    console.log("✅ Deployer has sufficient TLOOT balance");
    console.log("");
  }

  // Step 2: Transfer TLOOT to LuckyDrawFactory
  console.log("💸 Transferring", formatUnits(luckyDrawReserve, 18), "TLOOT to LuckyDrawFactory...");
  const transferHash1 = await deployer.writeContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'transfer',
    args: [LUCKY_DRAW_FACTORY, luckyDrawReserve],
    account: deployer.account,
  });

  await publicClient.waitForTransactionReceipt({ hash: transferHash1 });
  console.log("✅ Transferred to LuckyDrawFactory");
  console.log("   Tx:", transferHash1);
  console.log("");

  // Step 3: Transfer TLOOT to CommitToClaimFactory
  console.log("💸 Transferring", formatUnits(commitToClaimReserve, 18), "TLOOT to CommitToClaimFactory...");
  const transferHash2 = await deployer.writeContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'transfer',
    args: [COMMIT_TO_CLAIM_FACTORY, commitToClaimReserve],
    account: deployer.account,
  });

  await publicClient.waitForTransactionReceipt({ hash: transferHash2 });
  console.log("✅ Transferred to CommitToClaimFactory");
  console.log("   Tx:", transferHash2);
  console.log("");

  // Verify balances
  const ldFactoryBalance = await publicClient.readContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'balanceOf',
    args: [LUCKY_DRAW_FACTORY],
  });

  const ctcFactoryBalance = await publicClient.readContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'balanceOf',
    args: [COMMIT_TO_CLAIM_FACTORY],
  });

  console.log("=" .repeat(60));
  console.log("🎉 SETUP COMPLETE");
  console.log("=" .repeat(60));
  console.log("");
  console.log("Factory TLOOT Reserves:");
  console.log("- LuckyDrawFactory:        ", formatUnits(ldFactoryBalance as bigint, 18), "TLOOT");
  console.log("- CommitToClaimFactory:    ", formatUnits(ctcFactoryBalance as bigint, 18), "TLOOT");
  console.log("");
  console.log("✅ Factories are now ready to fund pools!");
  console.log("✅ Pools will receive TLOOT on creation");
  console.log("✅ Users will receive TLOOT immediately when joining");
  console.log("");
  console.log("Next Steps:");
  console.log("1. Redeploy factory contracts (they have new funding logic)");
  console.log("2. Run this script again with new factory addresses");
  console.log("3. Test pool creation and joining");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
