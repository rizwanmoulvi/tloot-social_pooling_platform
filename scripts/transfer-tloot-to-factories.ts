import { network } from "hardhat";
import { formatEther, formatUnits, parseUnits } from "viem";

/**
 * Alternative: Transfer existing TLOOT to factories
 * (When you don't own the TLOOT contract but have tokens)
 */

async function main() {
  console.log("🏦 Transferring existing TLOOT to factories...\n");

  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();
  
  console.log("Account:", deployer.account.address);
  const mntBalance = await publicClient.getBalance({ address: deployer.account.address });
  console.log("MNT balance:", formatEther(mntBalance), "MNT\n");

  // Contract addresses
  const TLOOT_TOKEN = "0x0470FF2ee65F43799fe4459840723a912137eE59";
  const LUCKY_DRAW_FACTORY = "0xfa221231867f5e7ed623133bebc2e565f5486339";
  const COMMIT_TO_CLAIM_FACTORY = "0x3849e494ffa344b8aa3aa7e355d1f06aafd4be46";

  const TLOOT_ABI = [
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
    }
  ];

  // Check current balance
  const currentBalance = await publicClient.readContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'balanceOf',
    args: [deployer.account.address],
  });

  console.log("Your TLOOT Balance:", formatUnits(currentBalance as bigint, 18), "TLOOT");
  console.log("");

  // Reserve amounts (reduced for testing)
  const luckyDrawReserve = parseUnits("100000", 18); // 100K TLOOT
  const commitToClaimReserve = parseUnits("50000", 18); // 50K TLOOT
  const totalNeeded = luckyDrawReserve + commitToClaimReserve;

  console.log("📊 Reserve Plan:");
  console.log("- LuckyDraw Reserve:       ", formatUnits(luckyDrawReserve, 18), "TLOOT");
  console.log("- CommitToClaim Reserve:   ", formatUnits(commitToClaimReserve, 18), "TLOOT");
  console.log("- Total Needed:            ", formatUnits(totalNeeded, 18), "TLOOT");
  console.log("");

  if ((currentBalance as bigint) < totalNeeded) {
    console.log("❌ ERROR: Insufficient TLOOT balance!");
    console.log("   You have:", formatUnits(currentBalance as bigint, 18), "TLOOT");
    console.log("   You need:", formatUnits(totalNeeded, 18), "TLOOT");
    console.log("");
    console.log("Options:");
    console.log("1. Get TLOOT from the owner (0x4935FD3245feeA9A64a89A03f38c593b240Becd4)");
    console.log("2. Use the owner account to run setup-tloot-reserves.ts");
    console.log("3. Reduce reserve amounts for testing");
    console.log("");
    return;
  }

  console.log("✅ You have sufficient TLOOT!");
  console.log("");

  // Transfer to LuckyDrawFactory
  console.log("💸 Transferring", formatUnits(luckyDrawReserve, 18), "TLOOT to LuckyDrawFactory...");
  const hash1 = await deployer.writeContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'transfer',
    args: [LUCKY_DRAW_FACTORY, luckyDrawReserve],
    account: deployer.account,
  });

  await publicClient.waitForTransactionReceipt({ hash: hash1 });
  console.log("✅ Transferred to LuckyDrawFactory");
  console.log("   Tx:", hash1);
  console.log("");

  // Wait a bit before next transaction
  console.log("⏳ Waiting 3 seconds before next transfer...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log("");

  // Transfer to CommitToClaimFactory
  console.log("💸 Transferring", formatUnits(commitToClaimReserve, 18), "TLOOT to CommitToClaimFactory...");
  const hash2 = await deployer.writeContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'transfer',
    args: [COMMIT_TO_CLAIM_FACTORY, commitToClaimReserve],
    account: deployer.account,
  });

  await publicClient.waitForTransactionReceipt({ hash: hash2 });
  console.log("✅ Transferred to CommitToClaimFactory");
  console.log("   Tx:", hash2);
  console.log("");

  // Verify final balances
  const ldBalance = await publicClient.readContract({
    address: TLOOT_TOKEN as `0x${string}`,
    abi: TLOOT_ABI,
    functionName: 'balanceOf',
    args: [LUCKY_DRAW_FACTORY],
  });

  const ctcBalance = await publicClient.readContract({
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
  console.log("- LuckyDrawFactory:        ", formatUnits(ldBalance as bigint, 18), "TLOOT ✅");
  console.log("- CommitToClaimFactory:    ", formatUnits(ctcBalance as bigint, 18), "TLOOT ✅");
  console.log("");
  console.log("✅ Factories funded and ready!");
  console.log("✅ Can now create pools that will receive TLOOT");
  console.log("✅ Users will receive TLOOT immediately when joining");
  console.log("");
  console.log("Test it:");
  console.log("1. Go to http://localhost:3000/pools/create");
  console.log("2. Create a pool");
  console.log("3. Join the pool and receive TLOOT!");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
